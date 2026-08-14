const CACHE_NAME = "splice-pwa-v5";
const OFFLINE_URL = "/offline";

/** Only precache the offline shell — never precache app HTML (stale chunk refs after rebuild). */
const PRECACHE_URLS = [OFFLINE_URL];

/**
 * Never intercept these — Auth.js / APIs must hit the network with a real Response.
 * Intercepting `/api/auth/*` with respondWith(fetch()) has caused:
 * "Failed to convert value to 'Response'" and broken credential sign-in.
 */
function shouldBypassServiceWorker(pathname) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest"
  );
}

function asResponse(value) {
  if (value instanceof Response) {
    return value;
  }
  return Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const targetUrl =
    typeof data.url === "string" && data.url.startsWith("/")
      ? data.url
      : typeof data.conversationId === "string" && data.conversationId
        ? `/messages/${data.conversationId}`
        : "/messages";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            const navigate =
              "navigate" in client && typeof client.navigate === "function"
                ? client.navigate(targetUrl)
                : Promise.resolve();

            return Promise.resolve(navigate).then(() => client.focus());
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }

        return undefined;
      }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Critical: do not call respondWith for auth/API — let the browser handle it.
  if (shouldBypassServiceWorker(requestUrl.pathname)) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => asResponse(response))
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedOffline = await cache.match(OFFLINE_URL);
          return asResponse(cachedOffline);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok || response.type === "opaque") {
            return asResponse(response ?? cached);
          }

          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) =>
            cache.put(event.request, copy),
          );
          return response;
        })
        .catch(() => asResponse(cached));
    }),
  );
});
