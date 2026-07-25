import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];

for (const required of ['index.html', 'data/products.json', 'data/products-overlay.json']) {
  try { await access(path.join(dist, required)); }
  catch { errors.push(`missing dist/${required}`); }
}

let base = { products: [] };
let overlay = { products: [] };
try {
  base = JSON.parse(await readFile(path.join(dist, 'data', 'products.json'), 'utf8'));
  overlay = JSON.parse(await readFile(path.join(dist, 'data', 'products-overlay.json'), 'utf8'));
} catch {}
const overlayProducts = Array.isArray(overlay.products) ? overlay.products : [];
const overlayIds = new Set(overlayProducts.map(product => product.id));
const products = [...(base.products || []).filter(product => !overlayIds.has(product.id)), ...overlayProducts];

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
