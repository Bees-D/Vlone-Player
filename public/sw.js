const CACHE_NAME = '999-vault-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
];

// Offline caching for tracks
const TRACK_CACHE = '999-tracks-v1';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Cache-First for UI assets
    if (ASSETS_TO_CACHE.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then((response) => {
                return response || fetch(request);
            })
        );
        return;
    }

    // Network-First for API
    if (url.hostname.includes('juicewrldapi.com') || url.hostname.includes('api.github.com')) {
        event.respondWith(
            fetch(request).catch(() => caches.match(request))
        );
        return;
    }

    // Special handling for audio files (Cache as they play)
    if (request.destination === 'audio' || request.destination === 'video') {
        event.respondWith(
            caches.open(TRACK_CACHE).then((cache) => {
                return cache.match(request).then((response) => {
                    if (response) return response;

                    return fetch(request).then((networkResponse) => {
                        // Only cache if it's a successful response
                        if (networkResponse.status === 200 || networkResponse.status === 206) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    });
                });
            })
        );
    }
});
