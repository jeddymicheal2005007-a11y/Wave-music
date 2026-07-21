const CACHE_NAME = 'wave-shell-v1';
const SHELL_FILES = ['./index-v2.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first for API calls (YouTube/lyrics/Firebase), cache-first fallback
// for the app shell files so the interface still loads if offline.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isShellFile = SHELL_FILES.some((f) => url.includes(f.replace('./', '')));

  if (isShellFile) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
  // All other requests (YouTube API, lyrics API, Firebase) go straight to network.
});
