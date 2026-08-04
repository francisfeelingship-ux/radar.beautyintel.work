import { NUMBUZIN_NO5_WEBP_BASE64 } from './numbuzin-no5-image.js';

const RESTORED_PRODUCT_ID = 'numbuzin-no5-vitamin-toner-restored';
const RESTORED_PRODUCT_PATH = '/data/numbuzin-no5-restored.json';
const RESTORED_IMAGE_PATH = '/assets/products/numbuzin-no5-restored/product.webp';

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

const restoredImageBytes = decodeBase64(NUMBUZIN_NO5_WEBP_BASE64);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === RESTORED_IMAGE_PATH) {
      return new Response(request.method === 'HEAD' ? null : restoredImageBytes, {
        status: 200,
        headers: {
          'content-type': 'image/webp',
          'content-length': String(restoredImageBytes.byteLength),
          'cache-control': 'no-store, max-age=0',
          'x-content-type-options': 'nosniff'
        }
      });
    }

    if (url.pathname === '/data/products-batch.json') {
      const restoredUrl = new URL(RESTORED_PRODUCT_PATH, url.origin);
      const [batchResponse, restoredResponse] = await Promise.all([
        env.ASSETS.fetch(request),
        env.ASSETS.fetch(new Request(restoredUrl.toString(), { method: 'GET' }))
      ]);

      if (!batchResponse.ok || !restoredResponse.ok) {
        return batchResponse;
      }

      const batch = await batchResponse.json();
      const restoredProduct = await restoredResponse.json();
      const products = Array.isArray(batch.products) ? batch.products : [];
      batch.products = [
        ...products.filter(product => product?.id !== RESTORED_PRODUCT_ID),
        restoredProduct
      ];

      return new Response(JSON.stringify(batch), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store, max-age=0'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
