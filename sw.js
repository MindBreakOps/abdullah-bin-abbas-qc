const CACHE_NAME = 'quran-center-v1';
const ASSETS = [
  '/',
  '/index.html', // Your main file name
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@300;400;500;700;900&display=swap',
  'https://raw.githubusercontent.com/MindBreakOps/OpSystem/main/aba.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', event => {
  event.respondWith(
	caches.match(event.request).then(response => response || fetch(event.request))
  );
});