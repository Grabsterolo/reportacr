// Service worker mínimo: cachea el shell de la app para que cargue rápido
// y sea instalable. No cachea datos de Supabase (siempre deben ser frescos).
const CACHE = 'reportacr-shell-v3';
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
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
