import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const removedProductIds = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner'
]);

for (const required of [
  'index.html',
  'data/products.json',
  'data/products-overlay.json',
  'data/products-batch.json',
  'data/numbuzin-no5-restored.json',
  'assets/products/numbuzin-no5-restored/product.webp'
]) {
  try { await access(path.join(dist, required)); }
  catch { errors.push(`missing dist/${required}`); }
}

const load = async name => {
  try { return JSON.parse(await readFile(path.join(dist, 'data', name), 'utf8')); }
  catch { return { products: [] }; }
};
const base = await load('products.json');
const overlay = await load('products-overlay.json');
const batch = await load('products-batch.json');
const restored = await load('numbuzin-no5-restored.json');
const additions = [
  ...(Array.isArray(overlay.products) ? overlay.products : []),
  ...(Array.isArray(batch.products) ? batch.products : []),
  ...(restored?.id ? [restored] : [])
];
const additionIds = new Set(additions.map(product => product.id));
const products = [
  ...(base.products || []).filter(product => !additionIds.has(product.id)),
  ...additions
].filter(product => !removedProductIds.has(product.id));

for (const product of products) {
  const assets = [product.bubbleImage, ...product.editorialCards.map(card => card.image)];
  for (const asset of assets) {
    const assetPath = asset.split('?')[0].replace(/^\//, '');
    try { await access(path.join(dist, assetPath)); }
    catch { errors.push(`${product.id}: missing built asset ${assetPath}`); }
  }
}

try {
  const sourceSvg = await readFile(path.join(root, 'public/assets/products/numbuzin-no5-restored/bubble.svg'), 'utf8');
  const marker = 'data:image/webp;base64,';
  const markerIndex = sourceSvg.indexOf(marker);
  const payloadStart = markerIndex + marker.length;
  const payloadEnd = markerIndex >= 0 ? sourceSvg.indexOf('"', payloadStart) : -1;
  if (markerIndex < 0 || payloadEnd < payloadStart) {
    errors.push('numbuzin-no5-vitamin-toner-restored: embedded source WebP is missing');
  } else {
    const expected = Buffer.from(sourceSvg.slice(payloadStart, payloadEnd).replace(/\s+/g, ''), 'base64');
    const image = await readFile(path.join(dist, 'assets/products/numbuzin-no5-restored/product.webp'));
    if (!image.equals(expected) || image.subarray(0, 4).toString('ascii') !== 'RIFF' || image.subarray(8, 12).toString('ascii') !== 'WEBP') {
      errors.push(`numbuzin-no5-vitamin-toner-restored: built WebP differs from source (${image.length} vs ${expected.length} bytes)`);
    }
  }
} catch {
  // The missing-file error is already recorded above.
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated deploy artifact with ${products.length} products and exact Numbuzin WebP.`);
