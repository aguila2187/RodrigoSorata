const CACHE_NAME = 'v1_cache_cafe_tentacion';
const urlsToCache = [
  './',
  './manifest.json',
  './img/cafe.png',
  './style.css',
  './script.js'
];

// Instalación del Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al abrir el caché:', err))
  );
});

// Activación del Service Worker
self.addEventListener('activate', e => {
  const cacheWhitelist = [CACHE_NAME];
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log('Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(res => {
        if (res) {
          return res;
        }
        
        // Para recursos no en caché
        return fetch(e.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(e.request, responseToCache);
              });

            return response;
          });
      })
      .catch(() => {
        // Manejo de recursos offline (opcional)
        console.log('Recurso no disponible y no está en caché.');
      })
  );
});
