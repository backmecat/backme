const CACHE_NAME = 'backmecat-v1.1'; // ✅ 版本號升級，強制更新
const BASE_PATH = '/backme'; // ✅ 新增：基礎路徑

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/admin.html`,
  `${BASE_PATH}/logo.jpg`,
  `${BASE_PATH}/menu.jpg`,
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;700&display=swap'
];

// 安裝 Service Worker 並快取資源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ 已開啟快取');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 啟用並清理舊快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 清除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求並提供快取
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // ✅ 修正：離線時返回正確路徑
          if (event.request.destination === 'document') {
            return caches.match(`${BASE_PATH}/index.html`);
          }
        });
      })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      console.log('🔄 執行背景同步')
    );
  }
});

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '您有新通知',
    icon: `${BASE_PATH}/logo.jpg`,
    badge: `${BASE_PATH}/logo.jpg`,
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('貝可米努奶喵館', options)
  );
});
