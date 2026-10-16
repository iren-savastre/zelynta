/* Zelynta — Service Worker (PWA offline).
   Strategie: network-first cu fallback pe cache.
   - online: ia mereu varianta proaspătă (nu strică hot-reload în dev);
   - offline: servește din cache; pentru navigări, cade pe shell-ul aplicației.

   Aplicația e servită dintr-un subfolder în producție (zelynta.com/app/) și din
   rădăcină în dezvoltare. Nu scriem calea de mână: service worker-ul își află
   singur locul din propriul URL, deci același fișier merge în amândouă. */
/* Zelynta — Service Worker (offline PWA).
   Strategy: network-first with a cache fallback.
   - online: always takes the fresh version (doesn't break hot-reload in dev);
   - offline: serves from cache; for navigations, falls back to the app shell.

   The app is served from a subfolder in production (zelynta.com/app/) and
   from the root in development. We don't hand-write the path: the service
   worker figures out its own location from its own URL, so the same file
   works in both. */
const CACHE = "zelynta-cache-v2";
const BASE = new URL("./", self.location).pathname; // "/app/" sau "/" // "/app/" or "/"
const CORE = [
  BASE,
  BASE + "manifest.json",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "favicon.ico",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  e.respondWith(
    fetch(req)
      .then((res) => {
        // pune în cache doar răspunsuri bune de pe același origin
        // only caches good responses from the same origin
        if (res && res.ok && sameOrigin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => {
          if (hit) return hit;
          // navigare offline -> shell-ul aplicației
          // offline navigation -> the app shell
          if (req.mode === "navigate") return caches.match(BASE);
          return Response.error();
        })
      )
  );
});

// permite paginii să forțeze actualizarea SW-ului
// lets the page force the SW to update
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
