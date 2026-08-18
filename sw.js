const CACHE_NAME = "fds-2026-v3-obsidian";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./favicon.png",
  "./manifest.json",
  "./sw.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("SW: Cache aberto, pre-cacheando arquivos v3");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Strategy: Network-First for HTML/Navigation to always get latest redesign
  if (event.request.mode === 'navigate' || event.request.destination === 'document' || event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return fetchResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((res) => res || caches.match("./index.html"));
        })
    );
    return;
  }

  // Strategy: Cache-First for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        if (!fetchResponse || fetchResponse.status !== 200 || event.request.method !== 'GET') {
          return fetchResponse;
        }
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(event.request, responseToCache);
          } catch(e) {}
        });
        return fetchResponse;
      }).catch(() => {
        return caches.match("./index.html");
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log("SW: Removendo cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});
