import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];
const productFeedFiles = [
  'products.json',
  'products-overlay.json',
  'products-batch.json',
  'products-import-20260727-4.json',
  'products-import-20260727-4b.json',
  'products-import-20260729-10.json',
  'products-import-20260730-8.json',
  'products-import-20260803-10.json'
];

for (const required of [
  'index.html',
  ...productFeedFiles.map(name => `data/${name}`),
  'data/media-platform-overrides.json'
]) {
  try {
    await access(path.join(dist, required));
  } catch {
    errors.push(`missing dist/${required}`);
  }
}

const load = async name => {
  try {
    return JSON.parse(await readFile(path.join(dist, 'data', name), 'utf8'));
  } catch {
    return { products: [] };
  }
};

const feeds = await Promise.all(productFeedFiles.map(load));
const productsById = new Map();
for (const feed of feeds) {
  for (const product of Array.isArray(feed.products) ? feed.products : []) {
    if (product?.id) productsById.set(product.id, product);
  }
}
const products = [...productsById.values()];

for (const product of products) {
  const cards = Array.isArray(product.editorialCards) ? product.editorialCards : [];
  const assets = [product.bubbleImage, ...cards.map(card => card.image)].filter(Boolean);
  for (const asset of assets) {
    const assetPath = asset.split('?')[0].replace(/^\//, '');
    try {
      await access(path.join(dist, assetPath));
    } catch {
      errors.push(`${product.id}: missing built asset ${assetPath}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated deploy artifact with ${products.length} products.`);
