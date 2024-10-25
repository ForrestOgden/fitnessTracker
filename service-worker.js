const CACHE_NAME = 'fitness-tracker-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css', // Path to your CSS file
    '/script.js', // Path to your main JavaScript file
    '/muscles.png', // Your app icon
    '/refresh.jpg', // Refresh button image
    // Add any other assets you need cached
];

// Install the service worker and cache files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Update the service worker and clear old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
