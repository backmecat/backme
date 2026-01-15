const CACHE_NAME = 'backmecat-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/logo.jpg',
  '/menu.jpg',
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
        // 如果快取中有，直接返回快取
        if (response) {
          return response;
        }
        
        // 否則發起網路請求
        return fetch(event.request).then(
          response => {
            // 檢查是否為有效回應
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 複製回應並存入快取
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // 如果網路請求失敗，返回離線頁面
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 背景同步功能（可選）
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // 在這裡執行同步邏輯
      console.log('🔄 執行背景同步')
    );
  }
});

// 推送通知功能（可選）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : '您有新通知',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('貝可米努奶喵館', options)
  );
});
