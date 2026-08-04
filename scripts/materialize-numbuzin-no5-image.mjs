import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productDirectory = path.join(root, 'public', 'assets', 'products', 'numbuzin-no5-restored');
const sourcePath = path.join(productDirectory, 'bubble.svg');
const outputPath = path.join(productDirectory, 'product.webp');
const svg = await readFile(sourcePath, 'utf8');
const marker = 'data:image/webp;base64,';
const markerIndex = svg.indexOf(marker);
const payloadStart = markerIndex + marker.length;
const payloadEnd = markerIndex >= 0 ? svg.indexOf('"', payloadStart) : -1;

if (markerIndex < 0 || payloadEnd < payloadStart) {
  throw new Error('The committed Numbuzin No.5 source SVG does not contain an embedded WebP.');
}

const base64 = svg.slice(payloadStart, payloadEnd).replace(/\s+/g, '');
const bytes = Buffer.from(base64, 'base64');
if (bytes.length < 12 || bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error(`Invalid Numbuzin No.5 WebP payload extracted from source SVG: ${bytes.length} bytes`);
}

await mkdir(productDirectory, { recursive: true });
await writeFile(outputPath, bytes);
console.log(`Materialized the exact embedded Numbuzin No.5 WebP (${bytes.length} bytes).`);
