/* Zelynta — Service Worker (PWA offline).
   Strategie: network-first cu fallback pe cache.
   - online: ia mereu varianta proaspătă (nu strică hot-reload în dev);
   - offline: servește din cache; pentru navigări, cade pe shell-ul aplicației ("/"). */
const CACHE = "zelynta-cache-v1";
const CORE = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png", "/favicon.ico"];

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
          if (req.mode === "navigate") return caches.match("/");
          return Response.error();
        })
      )
  );
});

// permite paginii să forțeze actualizarea SW-ului
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
