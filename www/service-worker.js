// Minimal service worker to prevent 404s
// Unregister any previously cached service worker
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        self.registration.unregister().then(() => {
            return self.clients.matchAll();
        }).then((clients) => {
            clients.forEach(client => client.navigate(client.url));
        })
    );
});
