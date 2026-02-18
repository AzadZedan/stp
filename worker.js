/**
 * Cloudflare Worker لمنصة ستامبكوين
 * يعمل كوسيط بين الواجهة الأمامية وخلفية التطبيق
 */

// إعدادات التطبيق
const API_BASE_URL = 'https://api.ecostamp.net';
const STATIC_CACHE_NAME = 'stampcoin-static';
const DYNAMIC_CACHE_NAME = 'stampcoin-dynamic';

// معالج حدث fetch
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * معالج الطلبات الرئيسي
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // معالجة الطلبات الثابتة
  if (url.pathname.startsWith('/public/') || url.pathname === '/') {
    return handleStaticRequest(request);
  }

  // معالجة الطلبات إلى API
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }

  // معالجة الطلبات إلى التوثيق
  if (url.pathname.startsWith('/docs/')) {
    return handleDocumentationRequest(request);
  }

  // معالجة الطلبات غير المعروفة
  return new Response('Not Found', { status: 404 });
}

/**
 * معالجة الطلبات الثابتة
 */
async function handleStaticRequest(request) {
  const cache = caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await (await cache).match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // إذا لم يتم العثور على الاستجابة في التخزين المؤقت، قم بجلبها من الشبكة
  const response = await fetch(request);

  // وضع الاستجابة في التخزين المؤقت للاستخدامات المستقبلية
  (await cache).put(request, response.clone());

  return response;
}

/**
 * معالجة الطلبات إلى API
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const apiEndpoint = url.pathname + url.search;

  // إنشاء الطلب الجديد
  const apiRequest = new Request(API_BASE_URL + apiEndpoint, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'
  });

  try {
    // إضافة معلومات التصريح إذا كانت موجودة
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey) {
      apiRequest.headers.set('X-API-Key', apiKey);
    }

    // إرسال الطلب إلى API
    const response = await fetch(apiRequest);

    // نسخ الاستجابة لمنع إغلاقها
    const clonedResponse = response.clone();

    // تخزين الاستجابة مؤقتاً
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    cache.put(request, clonedResponse);

    return response;
  } catch (error) {
    console.error('API request failed:', error);

    // محاولة الحصول على الاستجابة من التخزين المؤقت
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // إذا لم يتم العثور على استجابة مؤقتة، أرسل خطأ
    return new Response(JSON.stringify({
      success: false,
      error: 'API service unavailable',
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * معالجة الطلبات إلى التوثيق
 */
async function handleDocumentationRequest(request) {
  const cache = caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await (await cache).match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // إذا لم يتم العثور على الاستجابة في التخزين المؤقت، قم بجلبها من الشبكة
  const response = await fetch(request);

  // وضع الاستجابة في التخزين المؤقت للاستخدامات المستقبلية
  (await cache).put(request, response.clone());

  return response;
}

/**
 * معالج حدث activate (تم تنشيط Worker)
 */
addEventListener('activate', event => {
  // حذف التخزين المؤقت القديم
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * معالج حدث install (تم تثبيت Worker)
 */
addEventListener('install', event => {
  // فتح التخزين المؤقت
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      // إضافة الملفات الثابتة إلى التخزين المؤقت
      return cache.addAll([
        '/',
        '/public/index.html',
        '/public/css/style.css',
        '/public/js/app.js',
        '/public/docs/index.html',
        '/public/images/hero-image.png',
        '/public/favicon.ico',
        '/public/apple-touch-icon.png',
        '/public/favicon-32x32.png',
        '/public/favicon-16x16.png',
        '/public/site.webmanifest'
      ]);
    })
  );
});
