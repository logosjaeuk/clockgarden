const CACHE = 'clock-garden-v1';
const SHELL = ['/manifest.webmanifest', '/icon.svg'];
self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith('minute-glass-') || key.startsWith('clock-garden-')) &&
                key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin)
    return;
  const navigation = event.request.mode === 'navigate';
  if (!navigation && !url.pathname.startsWith('/_assets/') && !SHELL.includes(url.pathname)) return;
  // Cache only visited pages and their assets; queries must not grow storage unboundedly.
  const key = navigation ? url.origin + url.pathname : event.request;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE)
              .then((cache) => cache.put(key, copy))
              .catch(() => {}),
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(key);
        if (cached) return cached;
        if (!navigation) return Response.error();
        const ko = url.pathname.startsWith('/ko/');
        return new Response(
          `<!doctype html><html lang="${ko ? 'ko' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline · Clock Garden</title><h1>${ko ? '오프라인 상태입니다' : 'You are offline'}</h1><p>${ko ? '이 페이지는 아직 저장되지 않았습니다. 연결 후 다시 열어 주세요. 이전에 방문한 도구는 뒤로 가기로 열 수 있습니다.' : 'This page has not been saved yet. Reconnect and try again, or go back to a previously visited tool.'}</p></html>`,
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
        );
      }),
  );
});
