const RESTORED_PRODUCT_ID = 'numbuzin-no5-vitamin-toner-restored';
const RESTORED_PRODUCT_PATH = '/data/numbuzin-no5-restored.json';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
