from pathlib import Path
import base64
import json
import re
import subprocess

root = Path('.')
old_sha = '62e7850db9b85d299e15e96eddabd4c198cf4561'
product_id = 'numbuzin-no5-vitamin-boosting-essential-toner'
legacy_ids = {product_id, 'numbuzin-no5-vitamin-toner'}
asset_prefix = '/assets/products/numbuzin-no5-vitamin-toner/'

old_batch = json.loads(
    subprocess.check_output(
        ['git', 'show', f'{old_sha}:public/data/products-batch.json'],
        text=True,
    )
)
product = next(p for p in old_batch['products'] if p.get('id') in legacy_ids)
product['id'] = product_id
product['slug'] = product_id
product['bubbleImage'] = asset_prefix + 'bubble.svg'
product['bubbleFocal'] = '50% 50%'
product['editorialCards'] = [
    {'image': asset_prefix + 'product.webp', 'caption': '产品原图与多通路提亮定位'},
    {'image': asset_prefix + 'cards/02.svg', 'caption': '维 C、烟酰胺、熊果苷与修护底座'},
]


def is_target(item: dict) -> bool:
    return (
        item.get('id') in legacy_ids
        or item.get('slug') in legacy_ids
        or str(item.get('bubbleImage', '')).split('?')[0].startswith(asset_prefix)
    )


for path in [
    root / 'public/data/products.json',
    root / 'public/data/products-overlay.json',
    root / 'public/data/products-batch.json',
]:
    data = json.loads(path.read_text(encoding='utf-8'))
    data['products'] = [item for item in data.get('products', []) if not is_target(item)]
    if path.name == 'products-batch.json':
        insert_at = next(
            (
                i
                for i, item in enumerate(data['products'])
                if item.get('id') == 'numbuzin-no3-super-glowing-essence-toner'
            ),
            len(data['products']),
        )
        data['products'].insert(insert_at, product)
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )

index_path = root / 'index.html'
index_text = index_path.read_text(encoding='utf-8')
blocked = """          base.products = [
            ...(base.products || []).filter(product => !additionIds.has(product.id)),
            ...additions
          ].filter(product => ![
            'numbuzin-no5-vitamin-toner',
            'numbuzin-no5-vitamin-boosting-essential-toner'
          ].includes(product.id) && product.slug !== 'numbuzin-no5-vitamin-boosting-essential-toner' && product.bubbleImage?.split('?')[0] !== '/assets/products/numbuzin-no5-vitamin-toner/bubble.svg');"""
restored = """          base.products = [
            ...(base.products || []).filter(product => !additionIds.has(product.id)),
            ...additions
          ];"""
if blocked not in index_text:
    raise SystemExit('Numbuzin removal filter not found in index.html')
index_path.write_text(index_text.replace(blocked, restored), encoding='utf-8')

(root / 'worker.js').write_text(
    "export default {\n"
    "  async fetch(request, env) {\n"
    "    return env.ASSETS.fetch(request);\n"
    "  }\n"
    "};\n",
    encoding='utf-8',
)

package_path = root / 'package.json'
package = json.loads(package_path.read_text(encoding='utf-8'))
package['scripts']['build'] = 'vite build && node scripts/validate-dist.mjs'
package_path.write_text(
    json.dumps(package, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)

validate_path = root / 'scripts/validate-dist.mjs'
validate = validate_path.read_text(encoding='utf-8')
validate = re.sub(
    r"const removedProductIds = new Set\(\[\s*'numbuzin-no5-vitamin-boosting-essential-toner'\s*\]\);\s*",
    '',
    validate,
    count=1,
)
validate = validate.replace(
    "const products = [\n"
    "  ...(base.products || []).filter(product => !additionIds.has(product.id)),\n"
    "  ...additions\n"
    "].filter(product => !removedProductIds.has(product.id));",
    "const products = [\n"
    "  ...(base.products || []).filter(product => !additionIds.has(product.id)),\n"
    "  ...additions\n"
    "];",
)
if 'removedProductIds' in validate:
    raise SystemExit('validate-dist.mjs still contains the retired-product filter')
validate_path.write_text(validate, encoding='utf-8')

retired = root / 'scripts/remove-retired-products.mjs'
if retired.exists():
    retired.unlink()

asset_dir = root / 'public/assets/products/numbuzin-no5-vitamin-toner'
cards_dir = asset_dir / 'cards'
cards_dir.mkdir(parents=True, exist_ok=True)
encoded = (root / '.restore/numbuzin-no5-product.webp.b64').read_text(encoding='ascii')
image = base64.b64decode(encoded)
if len(image) != 9344:
    raise SystemExit(f'Wrong image byte count: {len(image)}')
(asset_dir / 'product.webp').write_bytes(image)
(asset_dir / 'bubble.svg').write_text(
    '''<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700" role="img" aria-labelledby="title desc">
  <title id="title">Numbuzin No.5 Vitamin Boosting Essential Toner</title>
  <desc id="desc">Exact uploaded product photograph, scaled uniformly without distortion or redrawing.</desc>
  <circle cx="350" cy="350" r="338" fill="#f7f7f7"/>
  <clipPath id="clip"><circle cx="350" cy="350" r="336"/></clipPath>
  <image x="70" y="0" width="560" height="700" preserveAspectRatio="xMidYMid meet" clip-path="url(#clip)" href="/assets/products/numbuzin-no5-vitamin-toner/product.webp"/>
</svg>
''',
    encoding='utf-8',
)
card = subprocess.check_output(
    [
        'git',
        'show',
        f'{old_sha}:public/assets/products/numbuzin-no5-vitamin-toner/cards/02.svg',
    ]
)
(cards_dir / '02.svg').write_bytes(card)

deploy_path = root / '.github/workflows/deploy-cloudflare-production.yml'
deploy = deploy_path.read_text(encoding='utf-8')
old_check = (
    '                && ! grep -q "numbuzin-no5-vitamin-boosting-essential-toner" /tmp/products-batch.json \\\n'
    '                && ! grep -q "numbuzin-no5-vitamin-toner" /tmp/products-batch.json \\\n'
    '                && [ "$ASSET_CODE" = "404" ]; then'
)
new_check = (
    '                && grep -q "numbuzin-no5-vitamin-boosting-essential-toner" /tmp/products-batch.json \\\n'
    '                && [ "$ASSET_CODE" = "200" ]; then'
)
if old_check not in deploy:
    raise SystemExit('Old Cloudflare verification condition was not found')
deploy = deploy.replace(old_check, new_check)
deploy = deploy.replace(
    '$DEPLOY_METHOD completed but live verification still found the retired product or asset',
    '$DEPLOY_METHOD completed but live verification did not find the restored Numbuzin product and asset',
)
deploy_path.write_text(deploy, encoding='utf-8')

(root / 'public/deploy-version.txt').write_text(
    'beauty-radar restore-numbuzin-no5-exact-image-20260804-2\n',
    encoding='utf-8',
)

print('Restored product data and exact 9344-byte uploaded WebP image.')
