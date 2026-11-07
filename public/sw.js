// BUTTON Men's Wear Service Worker
const CACHE_NAME = 'button-cache-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh network content
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
