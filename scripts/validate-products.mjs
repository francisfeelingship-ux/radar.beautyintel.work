import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const load = async name => {
  try { return JSON.parse(await readFile(path.join(publicRoot, 'data', name), 'utf8')); }
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
const manifest = {
  ...base,
  products: [...(base.products || []).filter(product => !additionIds.has(product.id)), ...additions]
};
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
    try { await access(path.join(publicRoot, asset.replace(/^\//, ''))); }
    catch { errors.push(`${product.id}: missing asset ${asset}`); }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${manifest.products.length} products and ${manifest.products.reduce((count, product) => count + product.editorialCards.length + 1, 0)} asset references.`);
