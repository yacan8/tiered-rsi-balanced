const cacheName = 'tiered-rsi-balanced-20261122205822';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key)));
    await self.clients.claim();
  }());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match('./index.html')) ?? Response.error();
      return Response.error();
    }
  }());
});
