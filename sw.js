// Vegan – offline-välimuisti
// Sovellus avautuu heti välimuistista ja päivittyy taustalla (stale-while-revalidate).
const CACHE = 'vegan-v5';
const CORE = ['./', './index.html', './manifest.webmanifest', './off-taxonomy.json', './inci.json', './icons/icon-192.png', './icons/apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/open(food|beauty|products|petfood)facts\.org$/.test(url.hostname)) return; // tuotehaku aina verkosta
  if (url.origin === location.origin) {
    e.respondWith(caches.open(CACHE).then(async ca => {
      const hit = await ca.match(req, { ignoreSearch: true });
      const net = fetch(req).then(r => { if (r.ok) ca.put(req, r.clone()); return r; }).catch(() => null);
      if (hit) { e.waitUntil(net); return hit; }
      return (await net) || (await ca.match('./index.html')) || Response.error();
    }));
    return;
  }
  // Kirjastot ja OCR-kielitiedostot: välimuisti ensin
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); } return r; })));
});
