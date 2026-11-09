// Foulée — service worker : rend l'app installable et utilisable hors ligne (interface).
// Les données passent par Firebase, qui garde sa propre copie hors ligne.
const CACHE = "foulee-v1";
const SHELL = ["foulee.html", "foulee-config.js", "foulee-manifest.json", "foulee-icon-192.png", "foulee-icon-512.png"];

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("foulee-") && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (!SHELL.some(f => u.pathname.endsWith("/" + f))) return;
  // réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
