import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NUMBUZIN_NO5_WEBP_BASE64 } from '../numbuzin-no5-image.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(root, 'public', 'assets', 'products', 'numbuzin-no5-restored');
const outputPath = path.join(outputDirectory, 'product.webp');
const bytes = Buffer.from(NUMBUZIN_NO5_WEBP_BASE64, 'base64');

if (bytes.length !== 9344 || bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error(`Invalid Numbuzin No.5 WebP payload: ${bytes.length} bytes`);
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, bytes);
console.log(`Materialized exact Numbuzin No.5 WebP (${bytes.length} bytes).`);
