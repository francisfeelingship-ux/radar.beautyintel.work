import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const removedProductIds = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner'
]);

for (const required of ['index.html', 'data/products.json', 'data/products-overlay.json', 'data/products-batch.json']) {
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
const additions = [
  ...(Array.isArray(overlay.products) ? overlay.products : []),
  ...(Array.isArray(batch.products) ? batch.products : [])
];
const additionIds = new Set(additions.map(product => product.id));
const products = [
  ...(base.products || []).filter(product => !additionIds.has(product.id)),
  ...additions
].filter(product => !removedProductIds.has(product.id));

for (const product of products) {
  const assets = [product.bubbleImage, ...product.editorialCards.map(card => card.image)];
  for (const asset of assets) {
    try { await access(path.join(dist, asset.replace(/^\//, ''))); }
    catch { errors.push(`${product.id}: missing built asset ${asset}`); }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated deploy artifact with ${products.length} products.`);
