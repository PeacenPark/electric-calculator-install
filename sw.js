// 설치 전용 페이지 서비스 워커 (sw.js)
const CACHE_NAME = 'electric-calculator-install-v1';

// 캐시할 파일 목록
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/install.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/qrcode@1.5.0/build/qrcode.min.js'
];

// 설치 시 캐시 파일 저장
self.addEventListener('install', event => {
  // 기존 서비스 워커를 대체하고 즉시 활성화
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 파일 저장 중');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 시 이전 캐시 삭제
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  // 활성화 즉시 클라이언트 제어 시작
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기 (캐시 우선 전략)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then(response => {
            // 유효한 응답이 아니면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답 복제 (stream은 한 번만 사용 가능)
            var responseToCache = response.clone();
            
            // 캐시에 저장
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            // 네트워크 오류 발생 시
            console.log('네트워크 요청 실패:', error);
            
            // 이미지나 폰트 등 비중요 리소스인 경우
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ttf|woff|woff2)$/)) {
              return new Response('', { status: 499, statusText: 'Network error' });
            }
            
            // HTML 페이지 요청인 경우 오프라인 페이지 반환
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 푸시 알림 이벤트 리스너 (선택사항)
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || '전기 계산기 앱을 설치해 보세요!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || '전기 계산기', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        const url = event.notification.data.url;
        
        // 이미 열려있는 창이 있다면 포커스 이동
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});