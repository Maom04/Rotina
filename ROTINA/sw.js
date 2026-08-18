/**
 * sw.js — Service Worker for offline-first caching
 * Cache-first strategy for all static assets.
 */

const CACHE_NAME = 'dashboard-v2';

const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'css/main.css',
  'css/components.css',
  'css/dashboard.css',
  'css/responsive.css',
  'js/utils.js',
  'js/storage.js',
  'js/router.js',
  'js/schedule.js',
  'js/tasks.js',
  'js/projects.js',
  'js/studies.js',
  'js/disciplines.js',
  'js/workload.js',
  'js/timer.js',
  'js/dashboard.js',
  'js/app.js',
  'data/default-data.js',
  'manifest.json',
];

// Install: pre-cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, network fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('index.html') || caches.match('./');
        }
      });
    })
  );
});

