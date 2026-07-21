import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];

for (const required of ['index.html', 'data/products.json']) {
  try { await access(path.join(dist, required)); }
  catch { errors.push(`missing dist/${required}`); }
}

let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(dist, 'data', 'products.json'), 'utf8'));
} catch {
  manifest = { products: [] };
}

for (const product of manifest.products || []) {
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

console.log(`Validated deploy artifact with ${manifest.products.length} products.`);
