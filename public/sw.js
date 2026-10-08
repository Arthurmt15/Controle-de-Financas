// Service Worker do app Finanças.
// Estratégia: o SW gerencia APENAS assets públicos pequenos (ícones, manifest).
// - /static/js e /static/css têm hash no nome + Cache-Control immutable:
//   o cache HTTP do navegador já resolve, e interceptar no SW só criava risco
//   de servir chunk obsoleto/corrompido (ChunkLoadError após deploy).
// - Navegações SPA são network-first SEM cachear HTML (HTML cacheado pode
//   referenciar chunks de deploy antigo que já não existem).

const CACHE_NAME = 'financas-v5';
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(request) {
  try {
    return new URL(request.url).origin === self.location.origin;
  } catch {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;
  if (event.request.url.includes('supabase.co')) return;

  // Bundles com hash: deixa o navegador cuidar (HTTP cache + immutable).
  // Interceptar aqui já causou "Falha no carregamento do <script>" pós-deploy.
  if (event.request.url.includes('/static/')) return;

  // Navegação SPA (/, /dashboard, /login etc) — sempre rede, sem cachear HTML.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Demais assets mesmos-origem (ícones etc) — stale-while-revalidate.
  if (!isSameOrigin(event.request)) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetched;
    })
  );
});
