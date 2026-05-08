// Service Worker for Spotify Clone
// Handles offline caching, audio/image optimization, and background sync

const CACHE_AUDIO = 'spotify-audio-v2';
const CACHE_IMAGES = 'spotify-images-v2';
const MAX_CACHE_ENTRIES = 200; // Approximate limit before eviction

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Pre-cache critical assets
  event.waitUntil(
    caches.open(CACHE_AUDIO).then((cache) => {
      return cache.add('/'); // Cache the app shell
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches with different names
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('spotify-') && 
            ![CACHE_AUDIO, CACHE_IMAGES].includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Cache audio files from Cloudinary or any audio source with size limit
  if (url.hostname.includes('cloudinary.com') || request.destination === 'audio') {
    event.respondWith(
      caches.open(CACHE_AUDIO).then(async (cache) => {
        try {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          const networkResponse = await fetch(request);
          if (networkResponse.status === 200) {
            // Simple cache size management: clone and store
            try {
              await cache.put(request, networkResponse.clone());
              // Optional: prune old entries if cache grows too large
              // (Implementation depends on Cache Storage API limits)
            } catch (err) {
              console.warn('Failed to cache audio:', err);
            }
          }
          return networkResponse;
        } catch (error) {
          console.error('Audio fetch error:', error);
          return new Response('Audio unavailable', { status: 503 });
        }
      })
    );
    return;
  }

  // Cache images
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(async (cache) => {
        try {
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          const networkResponse = await fetch(request);
          if (networkResponse.status === 200) {
            try {
              await cache.put(request, networkResponse.clone());
            } catch (err) {
              console.warn('Failed to cache image:', err);
            }
          }
          return networkResponse;
        } catch (error) {
          console.error('Image fetch error:', error);
          return new Response('Image unavailable', { status: 503 });
        }
      })
    );
    return;
  }

  // For other requests, use network-first strategy
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        return cached || new Response('Offline', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    });
  }
});

self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event.reason);
});
