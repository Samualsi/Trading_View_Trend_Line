const CACHE_NAME = 'support-resistance-generator-v1';
// All local assets that make up the app shell.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/CodeBlock.tsx',
  '/components/FloatingHelpButton.tsx',
  '/components/HelpModal.tsx',
  '/components/ThemeToggleButton.tsx',
  '/components/PriceChart.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/ChartIcon.tsx',
  '/components/icons/CopyIcon.tsx',
  '/components/icons/CloseIcon.tsx',
  '/components/icons/QuestionMarkIcon.tsx',
  '/components/icons/SunIcon.tsx',
  '/components/icons/MoonIcon.tsx',
  '/vite.svg'
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the resource is in the cache, return it
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // We need to clone the response because it's a stream
            // and can only be consumed once by the browser and the cache.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error('Fetching failed:', error);
            throw error;
        });
      })
  );
});

// On activate, remove old caches to keep things clean
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});