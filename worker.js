const REMOVED_PRODUCT_IDS = new Set([
  'numbuzin-no5-vitamin-boosting-essential-toner'
]);

const FILTERED_DATA_PATHS = new Set([
  '/data/products.json',
  '/data/products-overlay.json',
  '/data/products-batch.json'
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (FILTERED_DATA_PATHS.has(url.pathname)) {
      const response = await env.ASSETS.fetch(request);
      if (!response.ok) return response;

      const data = await response.json();
      if (Array.isArray(data.products)) {
        data.products = data.products.filter(product => !REMOVED_PRODUCT_IDS.has(product.id));
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-cache'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
