const REMOVED_PRODUCT_IDS = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner',
  'numbuzin-no5-vitamin-toner'
]);

const REMOVED_PRODUCT_SLUGS = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner',
  'numbuzin-no5-vitamin-toner'
]);

const REMOVED_BUBBLE_IMAGE = '/assets/products/numbuzin-no5-vitamin-toner/bubble.svg';
const REMOVED_ASSET_PREFIX = '/assets/products/numbuzin-no5-vitamin-toner/';

const FILTERED_DATA_PATHS = new Set([
  '/data/products.json',
  '/data/products-overlay.json',
  '/data/products-batch.json'
]);

function isRemovedProduct(product) {
  return REMOVED_PRODUCT_IDS.has(product?.id)
    || REMOVED_PRODUCT_SLUGS.has(product?.slug)
    || product?.bubbleImage?.split('?')[0] === REMOVED_BUBBLE_IMAGE;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith(REMOVED_ASSET_PREFIX)) {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          'cache-control': 'no-store'
        }
      });
    }

    if (FILTERED_DATA_PATHS.has(url.pathname)) {
      const response = await env.ASSETS.fetch(request);
      if (!response.ok) return response;

      const data = await response.json();
      if (Array.isArray(data.products)) {
        data.products = data.products.filter(product => !isRemovedProduct(product));
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
