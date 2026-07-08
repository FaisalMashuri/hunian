// Service worker Optio — installable PWA + tahan koneksi buruk.
// Strategi:
//  - App shell (/, /offline, icon, manifest) di-precache saat install.
//  - Navigasi halaman: network-first → cache → fallback /offline.
//  - Aset statis (_next, gambar, css, js): stale-while-revalidate.
//  - Request non-GET / lintas-origin / API dinamis: selalu ke network (tidak di-cache).
// Bukan full offline: data (Supabase/API) tetap butuh koneksi.

const VERSION = "v3";
const CACHE = `optio-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll gagal-semua kalau satu URL 404; pakai per-item agar tahan sebagian gagal.
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => {})
          )
        )
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Izinkan halaman menyuruh SW baru langsung aktif (dipakai saat ada update).
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya GET same-origin. POST/API/lintas-origin lewat langsung ke network.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    isApiRequest(url)
  ) {
    return;
  }

  // Navigasi halaman: network-first, fallback cache halaman → app shell → /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/")) ||
            (await cache.match(OFFLINE_URL))
          );
        })
    );
    return;
  }

  // Aset statis: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res && res.status === 200) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
