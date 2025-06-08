// Cache nama untuk aplikasi
const CACHE_NAME = 'story-app-cache-v1';

// Daftar aset yang akan di-cache
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/images/placeholder.svg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
];

// Event install service worker
self.addEventListener('install', event => {
  console.log('Installing Service Worker...');

  // Proses caching aset-aset statis
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(assetsToCache);
    })
  );
});

// Event aktivasi, membersihkan cache lama
self.addEventListener('activate', event => {
  console.log('Activating Service Worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName !== CACHE_NAME;
          })
          .map(cacheName => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Event fetch untuk offline capability
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Skip cross-origin requests
  if (requestUrl.origin !== location.origin) {
    // Untuk resource yang berasal dari CDN dan API
    event.respondWith(
      caches
        .match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
        .catch(error => {
          console.log('Fetch error:', error);
          return caches.match('/images/placeholder.svg');
        })
    );
    return;
  }

  // Untuk API request dengan strategi stale-while-revalidate
  if (requestUrl.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Jika response berhasil, cache juga
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Strategi cache-first untuk aset statis
  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback untuk gambar
        if (event.request.url.includes('/images/')) {
          return caches.match('/images/placeholder.svg');
        }
        // Fallback untuk halaman html
        if (event.request.headers.get('Accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('Tidak dapat terhubung ke internet', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        });
      })
  );
});

// Event push notification
self.addEventListener('push', event => {
  console.log('Service Worker: Received push event');

  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: 'Story App Notification',
      body: 'Ada cerita baru untuk dilihat!',
      icon: '/icons/icon-192x192.png',
    };
  }

  const options = {
    body: notificationData.body || 'Ada cerita baru untuk dilihat!',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Story App Notification', options)
  );
});

// Event click pada notification
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const urlToOpen =
    event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  event.waitUntil(clients.openWindow(urlToOpen));
});
