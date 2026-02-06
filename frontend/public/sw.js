// Service Worker pour PWA
const CACHE_NAME = 'ticketpro-v1';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache pour fonctionnement hors-ligne
const STATIC_CACHE = [
    '/',
    '/offline.html',
    '/manifest.json',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Service Worker: Cache ouvert');
            return cache.addAll(STATIC_CACHE);
        })
    );

    // Force l'activation immédiate
    self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activation');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Suppression ancien cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // Prend le contrôle immédiatement
    self.clients.claim();
});

// Stratégie de cache : Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes API (toujours en ligne)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cloner la réponse
                const responseToCache = response.clone();

                // Mettre en cache la nouvelle réponse
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                // En cas d'échec réseau, utiliser le cache
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }

                    // Si pas en cache et navigation, afficher page offline
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                });
            })
    );
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
