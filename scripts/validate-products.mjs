import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'data', 'products.json'), 'utf8'));
const ids = new Set();
const errors = [];

for (const product of manifest.products) {
  if (ids.has(product.id)) errors.push(`duplicate id: ${product.id}`);
  ids.add(product.id);
  for (const field of ['id', 'slug', 'brand', 'name', 'shortName', 'category', 'positioning', 'bubbleImage', 'summary', 'evidenceBoundary', 'layout']) {
    if (!product[field]) errors.push(`${product.id}: missing ${field}`);
  }
  const assets = [product.bubbleImage, ...product.editorialCards.map(card => card.image)];
  for (const asset of assets) {
    try { await access(path.join(root, asset.replace(/^\//, ''))); }
    catch { errors.push(`${product.id}: missing asset ${asset}`); }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${manifest.products.length} products and ${manifest.products.reduce((count, product) => count + product.editorialCards.length + 1, 0)} asset references.`);
