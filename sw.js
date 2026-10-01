// Steel-work : service worker (fonctionnement hors ligne)
// À CHAQUE MISE À JOUR de l'appli : augmentez ce numéro (v1 -> v2 -> v3...)
const CACHE = 'steel-work-v1';

const FICHIERS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation : on garde une copie de tous les fichiers
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FICHIERS)));
  self.skipWaiting();
});

// Activation : on supprime les anciennes copies
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Chaque demande : d'abord la copie locale, sinon internet
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((reponse) => {
      if (reponse) return reponse;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
