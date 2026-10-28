// Geezer Ball Scorecard service worker.
// The app page: network-first so updates always show; falls back to the saved copy with no signal.
// Firebase, spreadsheet and font libraries: saved on the phone the first time, so the app opens and scores offline.
const CACHE = 'geezer-ball-v4';
const FB = 'https://www.gstatic.com/firebasejs/10.13.2/';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './favicon-32.png',
  FB + 'firebase-app.js', FB + 'firebase-auth.js', FB + 'firebase-firestore.js'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(()=>{}))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
const LIB = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/|fonts\.googleapis\.com\/|fonts\.gstatic\.com\/)/;
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (LIB.test(req.url)) {   // versioned libraries: use the saved copy, fetch and save it the first time
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{}); } return res; })));
    return;
  }
  if (url.origin !== self.location.origin) return;   // never touch Firebase database or sign-in traffic
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{}); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
