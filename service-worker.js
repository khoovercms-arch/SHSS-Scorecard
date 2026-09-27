// Geezer Ball Scorecard service worker — network-first so updates always show.
const CACHE = 'geezer-ball-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon-32.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{})); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // never touch Firebase/CDN traffic
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{}); return res; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
