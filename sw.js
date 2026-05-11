// تغيير رقم الإصدار يجبر المتصفح على تحديث الـ Service Worker
const CACHE_NAME = 'quran-center-v2';

// نضع هنا الملفات المحلية الأساسية فقط باستخدام مسارات نسبية
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل فوري للإصدار الجديد
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('جاري حفظ الملفات للعمل دون اتصال...');
      // هذه الطريقة تمنع توقف النظام بالكامل إذا فشل رابط واحد
      return Promise.all(
        LOCAL_ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn('تعذر حفظ الملف مسبقاً:', url, err));
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  // تنظيف أي نسخ قديمة من الكاش
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // تخطي طلبات قواعد البيانات (Supabase) والطلبات غير المدعومة
  if (event.request.method !== 'GET' || event.request.url.includes('supabase.co')) {
      return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. إذا كان الملف موجوداً في الكاش، قم بإرجاعه فوراً (يعمل Offline)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. إذا لم يكن في الكاش، قم بجلبه من الإنترنت
      return fetch(event.request).then(networkResponse => {
        // حفظ نسخة من الملفات الخارجية (مثل الخطوط ومكتبة html2canvas) في الكاش لاستخدامها لاحقاً
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
         // تجاهل أخطاء الشبكة أثناء وضع الـ Offline
      });
    })
  );
});
