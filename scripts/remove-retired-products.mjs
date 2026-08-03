import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const removedProductIds = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner',
  'numbuzin-no5-vitamin-toner'
]);

const removedProductSlugs = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner',
  'numbuzin-no5-vitamin-toner'
]);

const removedBubbleImage = '/assets/products/numbuzin-no5-vitamin-toner/bubble.svg';

function isRetiredProduct(product) {
  return removedProductIds.has(product?.id)
    || removedProductSlugs.has(product?.slug)
    || product?.bubbleImage?.split('?')[0] === removedBubbleImage;
}

for (const relativePath of [
  'data/products.json',
  'data/products-overlay.json',
  'data/products-batch.json'
]) {
  const filePath = path.join(dist, relativePath);
  const data = JSON.parse(await readFile(filePath, 'utf8'));

  if (Array.isArray(data.products)) {
    data.products = data.products.filter(product => !isRetiredProduct(product));
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

await rm(path.join(dist, 'assets/products/numbuzin-no5-vitamin-toner'), {
  recursive: true,
  force: true
});
