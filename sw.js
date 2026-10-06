/* ScholarSync service worker — precache the whole app so it works fully offline.
   To ship an update: change CACHE_VERSION (the app shows a "Restart" toast to users). */
const CACHE_VERSION = 'v1.0.1';
const CACHE_NAME = 'scholarsync-' + CACHE_VERSION;

const PRECACHE = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/icons.js',
  './js/i18n.js',
  './js/store.js',
  './js/audio.js',
  './js/app.js',
  './icons/favicon.ico',
  './icons/icon-32.png',
  './icons/icon-96.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('scholarsync-') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: serve the app shell (query strings from shortcuts are ignored for matching)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => cached || fetch(req).catch(() => caches.match('./index.html')))
    );
    return;
  }

  // Everything else: cache first, then network (and cache the fresh copy)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

/* Clicking a timer notification brings the app to the front */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const client = list.find(c => 'focus' in c);
      if (client) return client.focus();
      return self.clients.openWindow('./?view=focus');
    })
  );
});
