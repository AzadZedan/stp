# 🔗 API Reference | مرجع API | API-Referenz

مرجع تفاعلي لجميع نقاط نهاية API في Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يحتوي هذا المرجع على جميع نقاط نهاية API المتاحة في Stampcoin Organization مع وصف تفصيلي لكل نقطة نهاية.

## المحتويات | Contents | Inhaltsverzeichnis

- [نظام المحفظة (Wallet API)](wallet-api.md)
- [نظام السوق (Marketplace API)](marketplace-api.md)
- [نظام المصادقة (Authentication API)](authentication-api.md)
- [نظام الـ AI Agent](ai-agent-api.md)

## استخدام المرجع | Using the Reference | Verwendung der Referenz

يمكنك استخدام هذا المرجع للبحث عن نقاط النهاية حسب:
- نظام API (المحفظة، السوق، المصادقة، الـ AI Agent)
- نوع الطلب (GET, POST, PUT, DELETE)
- الوظيفة (إنشاء، قراءة، تحديث، حذف)

## نقاط النهاية المشتركة | Common Endpoints | Gemeinsame Endpunkte

### التحقق من صحة النظام | Health Check | System-Prüfung

**GET** `/health`

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "status": "ok",
  "timestamp": "2023-05-15T14:30:00Z",
  "service": "Stampcoin Platform",
  "version": "1.0.0"
}
```

### معلومات النظام | System Information | Systeminformationen

**GET** `/info`

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "name": "Stampcoin Platform",
  "version": "1.0.0",
  "description": "منصة الطوابع الرقمية القائمة على البلوك تشين",
  "author": "Stampcoin Team",
  "license": "MIT",
  "endpoints": {
    "authentication": "/api/auth",
    "wallet": "/api/wallet",
    "marketplace": "/api/marketplace",
    "agent": "/api/agent"
  }
}
```

## كود حالة الاستجابة | HTTP Status Codes | HTTP-Statuscodes

| الكود | الوصف |
|------|------|
| 200 | نجاح الطلب |
| 201 | تم إنشاء المورد بنجاح |
| 204 | تمت العملية بنجاح ولكن لا يوجد محتوى للعودة |
| 400 | معاملات غير صحيحة |
| 401 | غير مصرور به |
| 403 | ممنوع |
| 404 | المورد غير موجود |
| 409 | تعارض |
| 422 | بيانات غير صالحة |
| 429 | عدد كبير جدًا من الطلبات |
| 500 | خطأ داخلي في الخادم |
| 503 | الخدمة غير متاحة حاليًا |

## معايير الاستجابة | Response Standards | Antwortstandards

### الاستجابة الناجحة | Successful Response | Erfolgreiche Antwort

```json
{
  "success": true,
  "data": {
    // بيانات الاستجابة
  },
  "timestamp": "2023-05-15T14:30:00Z"
}
```

### الاستجابة غير الناجحة | Error Response | Fehlerantwort

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "وصف الخطأ"
  },
  "timestamp": "2023-05-15T14:30:00Z"
}
```

### معايير الترحيل | Pagination Standards | Paginierungsstandards

```json
{
  "success": true,
  "data": [
    // بيانات الصفحة
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2023-05-15T14:30:00Z"
}
```

## المصادقة والترخيص | Authentication & Authorization | Authentifizierung & Autorisierung

### التوكنات | Tokens | Tokens

- **Access Token**: توكن قصير الأمد (1-2 ساعة) لطلبات API
- **Refresh Token**: توكن طويل الأمد (7 أيام) لتحديث التوكنات

### استخدام التوكنات | Using Tokens | Verwendung von Tokens

يجب إضافة التوكن في رأس الطلب لجمطلبات API التي تتطلب مصادقة:

```bash
curl -X GET https://api.stampcoin.com/api/wallet/balance   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## معدل الطلبات | Rate Limiting | Ratenbegrenzung

يتم تطبيق حد على عدد الطلبات التي يمكن إرسالها في فترة زمنية محددة:

- **الحد الأقصى للطلبات**: 100 طلب لكل دقيقة
- **الحد الأقصى للطلبات غير المصادق عليها**: 10 طلبات لكل دقيقة

## معالجة الأخطاء | Error Handling | Fehlerbehandlung

### معالجة الأخطاء في العميل | Error Handling in Client | Fehlerbehandlung im Client

```javascript
// مثال JavaScript لمعالجة الأخطاء
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل الطلب');
    }

    return await response.json();
  } catch (error) {
    console.error('خطأ في الاتصال بالـ API:', error);
    throw error;
  }
};

// مثال الاستخدام
try {
  const walletData = await apiCall('https://api.stampcoin.com/api/wallet/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  console.log(walletData);
} catch (error) {
  console.error('فشل جلب بيانات المحفظة:', error);
}
```

## أمثلة على الاستخدام | Usage Examples | Anwendungsbeispiele

### 1. تسجيل الدخول والحصول على توكن | Login and Get Token | Anmelden und Token erhalten

```javascript
const login = async (email, password) => {
  const response = await fetch('https://api.stampcoin.com/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    // حفظ التوكنات
    localStorage.setItem('accessToken', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  } else {
    throw new Error(data.error?.message || 'فشل تسجيل الدخول');
  }
};
```

### 2. إنشاء محفظة جديدة | Create New Wallet | Neue Wallet erstellen

```javascript
const createWallet = async (userId, currency = 'STP') => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch('https://api.stampcoin.com/api/wallet/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId, currency })
  });

  const data = await response.json();

  if (data.success) {
    return data.walletId;
  } else {
    throw new Error(data.error?.message || 'فشل إنشاء المحفظة');
  }
};
```

### 3. عرض قائمة الطوابع | Get Stamps List | Stamps-Liste abrufen

```javascript
const getStamps = async (category = '', page = 1, limit = 10) => {
  const params = new URLSearchParams({
    category,
    page,
    limit
  });

  const response = await fetch(`https://api.stampcoin.com/api/marketplace/stamps?${params}`);

  if (!response.ok) {
    throw new Error('فشل جلب قائمة الطوابع');
  }

  const data = await response.json();

  if (data.success) {
    return data.stamps;
  } else {
    throw new Error(data.error?.message || 'فشل جلب قائمة الطوابع');
  }
};
```

## الأمان | Security | Sicherheit

- يجب استخدام HTTPS في جميع الاتصالات
- يجب عدم مشاركة التوكنات مع أي طرف ثالث
- يجب تحديث التوكنات بانتظام
- يجب التحقق من صحة جميع الردود من الخادم
- يجب تجنب تخزين بيانات حساسة في العميل

## الدعم والدعم | Support & Feedback | Unterstützung & Feedback

للمساعدة في استخدام API أو للإبلاغ عن مشاكل، يرجى:
- فتح تذكرة في مستودع GitHub
- مراجعة قسم [المساهمة](../../CONTRIBUTING.md)
