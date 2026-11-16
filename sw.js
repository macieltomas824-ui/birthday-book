/* ============================================================================
   SERVICE WORKER  ·  sw.js
   ============================================================================
   PWA opcional: guarda el libro en caché para que pueda abrirse sin conexión
   después de la primera visita. No guarda nada de otras webs.

   Si publicas una versión nueva y quieres forzar la actualización, cambia
   CACHE_VERSION (por ejemplo a "v2"). El navegador descartará la copia vieja.
   ========================================================================== */

const CACHE_VERSION = "entre-petalos-v1";
const APP_SHELL = [
  "./",
  "index.html",
  "personalizar.html",
  "manifest.webmanifest",
  "css/base.css",
  "css/book.css",
  "css/pages.css",
  "css/print.css",
  "js/config.js",
  "js/overrides.js",
  "js/utils.js",
  "js/art.js",
  "js/qr.js",
  "js/pages.js",
  "js/comments.js",
  "js/music.js",
  "js/app.js",
  "vendor/qrcode.js",
  "assets/fonts/cormorant.woff2",
  "assets/fonts/cormorant-italic.woff2",
  "assets/fonts/nunito.woff2",
  "assets/fonts/caveat.woff2",
  "assets/fonts/pixelify.woff2",
  "assets/icons/favicon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/apple-touch-icon.png",
  "assets/images/pusheen.svg",
  "assets/images/tommy.svg",
  "assets/images/pusheen-tommy.svg",
  "assets/images/recuerdo-01.svg",
  "assets/images/recuerdo-02.svg",
  "assets/images/recuerdo-03.svg",
  "assets/images/recuerdo-04.svg",
  "assets/images/recuerdo-05.svg",
  "assets/images/recuerdo-06.svg",
  "assets/drawings/dibujo-01.svg",
  "assets/drawings/dibujo-02.svg",
  "assets/drawings/dibujo-03.svg",
  "assets/drawings/dibujo-04.svg",
  "assets/flowers/marco-rosa.svg",
  "assets/flowers/marco-margarita.svg",
  "assets/flowers/marco-tulipan.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        // addAll falla entero si un archivo falta; los añadimos uno a uno.
        Promise.all(
          APP_SHELL.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (!/^https?:$/.test(url.protocol)) return;

  // Navegación: red primero (contenido fresco) y caché como respaldo offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put("index.html", copy));
          }
          return response;
        })
        .catch(() =>
          caches.match("index.html").then((cached) => cached || caches.match("./"))
        )
    );
    return;
  }

  // Recursos estáticos: caché primero, luego red (y se guarda para la próxima).
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || !response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy)).catch(() => null);
        return response;
      });
    })
  );
});
