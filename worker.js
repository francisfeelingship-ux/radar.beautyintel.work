const NUMBUZIN_NO5_BUBBLE = '/assets/products/numbuzin-no5-vitamin-toner/bubble.svg';
const NUMBUZIN_NO5_ORIGINAL = '/assets/products/numbuzin-no5-vitamin-toner/bubble-original.svg';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve the untouched original asset at the legacy URL as well.
    if (url.pathname === NUMBUZIN_NO5_BUBBLE) {
      const originalUrl = new URL(NUMBUZIN_NO5_ORIGINAL, url.origin);
      return env.ASSETS.fetch(new Request(originalUrl, request));
    }

    return env.ASSETS.fetch(request);
  }
};
