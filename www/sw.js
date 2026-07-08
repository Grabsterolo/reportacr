// Service worker mínimo: cachea el shell de la app para que cargue rápido
// y sea instalable. No cachea datos de Supabase (siempre deben ser frescos).
const CACHE = 'reportacr-shell-v4';
const SHELL = [
  './index.html', './manifest.json', './privacy.html',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './favicon.ico', './favicon.svg', './favicon-16.png', './favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Never cache Supabase API calls - always go to network for live data
  if (url.hostname.includes('supabase.co') || url.hostname.includes('nominatim')) return;
  if (event.request.method !== 'GET') return;

  // Network-first for our own shell files: a deploy shows up on the very next
  // load instead of staying frozen at whatever was cached on a previous visit.
  // Only falls back to the cached copy when there's no connection at all.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
