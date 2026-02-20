# 🛍️ Marketplace API | واجهة برمجة السوق | Markt API

توثيق تفصيلي لواجهة برمجة تطبيقات نظام السوق في Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يوفر نظام السوق واجهات برمجة لشراء وبيع الطوابع الرقمية بين المستخدمين.

## نقاط النهاية الرئيسية | Main Endpoints | Hauptendpunkte

### 1. الحصول على قائمة الطوابع | Get Stamps List | Stamps-Liste abrufen

**GET** `/api/marketplace/stamps`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| category | string | لا | تصنيف الطوابع |
| page | number | لا | رقم الصفحة (افتراضي: 1) |
| limit | number | لا | عدد النتائج لكل صفحة (افتراضي: 20) |
| sortBy | string | لا | ترتيب النتائج (price, date, popularity) |
| sortOrder | string | لا | ترتيب تصاعدي/تنازلي (asc, desc) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET "https://api.stampcoin.com/api/marketplace/stamps?category=vintage&page=1&limit=10&sortBy=price&sortOrder=desc"
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "totalStamps": 150,
  "stamps": [
    {
      "id": "stamp_987654321",
      "name": "طابع بريد vintage 1950",
      "description": "طابع نادر من عام 1950",
      "category": "vintage",
      "price": 120.50,
      "currency": "STP",
      "owner": "user123",
      "imageUrl": "https://example.com/stamps/vintage_1950.jpg",
      "likes": 45,
      "listedAt": "2023-05-15T14:30:00Z"
    },
    {
      "id": "stamp_123456789",
      "name": "طابع بريد classic 1970",
      "description": "طابع كلاسيكي من عام 1970",
      "category": "classic",
      "price": 85.00,
      "currency": "STP",
      "owner": "user456",
      "imageUrl": "https://example.com/stamps/classic_1970.jpg",
      "likes": 32,
      "listedAt": "2023-05-14T10:15:00Z"
    }
  ]
}
```

### 2. الحصول على تفاصيل طابع | Get Stamp Details | Stamm-Details abrufen

**GET** `/api/marketplace/stamps/{stampId}`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| stampId | string | نعم | معرّف الطابع |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET https://api.stampcoin.com/api/marketplace/stamps/stamp_987654321
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "stamp": {
    "id": "stamp_987654321",
    "name": "طابع بريد vintage 1950",
    "description": "طابع نادر من عام 1950 في حالة ممتازة",
    "category": "vintage",
    "price": 120.50,
    "currency": "STP",
    "owner": "user123",
    "ownerName": "محمد أحمد",
    "imageUrl": "https://example.com/stamps/vintage_1950.jpg",
    "images": [
      "https://example.com/stamps/vintage_1950_front.jpg",
      "https://example.com/stamps/vintage_1950_back.jpg"
    ],
    "likes": 45,
    "views": 230,
    "listedAt": "2023-05-15T14:30:00Z",
    "attributes": {
      "year": 1950,
      "country": "مصر",
      "condition": "ممتاز",
      "rarity": "نادر"
    },
    "history": [
      {
        "date": "2023-05-10T09:20:00Z",
        "event": "تم شراء الطابع",
        "price": 110.00,
        "user": "user789"
      },
      {
        "date": "2023-05-05T14:45:00Z",
        "event": "تم إدراج الطابع للبيع",
        "price": 120.50,
        "user": "user123"
      }
    ]
  }
}
```

### 3. إنشاء طلب شراء | Create Buy Order | Kaufauftrag erstellen

**POST** `/api/marketplace/orders/buy`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| stampId | string | نعم | معرّف الطابع |
| quantity | number | نعم | الكمية |
| price | number | نعم | السعر لكل وحدة |
| walletId | string | نعم | معرّف المحفظة |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/marketplace/orders/buy   -H "Content-Type: application/json"   -d '{
    "stampId": "stamp_987654321",
    "quantity": 1,
    "price": 120.50,
    "walletId": "wal_123456789"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "orderId": "ord_abc123",
  "stampId": "stamp_987654321",
  "quantity": 1,
  "price": 120.50,
  "total": 120.50,
  "currency": "STP",
  "status": "pending",
  "createdAt": "2023-05-15T14:35:00Z"
}
```

### 4. إنشاء طلب بيع | Create Sell Order | Verkaufsauftrag erstellen

**POST** `/api/marketplace/orders/sell`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| stampId | string | نعم | معرّف الطابع |
| quantity | number | نعم | الكمية |
| price | number | نعم | السعر لكل وحدة |
| walletId | string | نعم | معرّف المحفظة |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/marketplace/orders/sell   -H "Content-Type: application/json"   -d '{
    "stampId": "stamp_987654321",
    "quantity": 1,
    "price": 125.00,
    "walletId": "wal_123456789"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "orderId": "ord_def456",
  "stampId": "stamp_987654321",
  "quantity": 1,
  "price": 125.00,
  "total": 125.00,
  "currency": "STP",
  "status": "active",
  "listedAt": "2023-05-15T14:40:00Z"
}
```

### 5. الحصول على طلبات المستخدم | Get User Orders | Benutzerbestellungen abrufen

**GET** `/api/marketplace/orders/user`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| userId | string | نعم | معرّف المستخدم |
| type | string | لا | نوع الطلب (buy, sell, all) |
| status | string | لا | حالة الطلب (pending, active, completed, cancelled) |
| page | number | لا | رقم الصفحة (افتراضي: 1) |
| limit | number | لا | عدد النتائج لكل صفحة (افتراضي: 20) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET "https://api.stampcoin.com/api/marketplace/orders/user?userId=user123&type=all&status=active&page=1&limit=10"
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "userId": "user123",
  "page": 1,
  "limit": 10,
  "totalOrders": 25,
  "orders": [
    {
      "id": "ord_abc123",
      "type": "buy",
      "stampId": "stamp_987654321",
      "stampName": "طابع بريد vintage 1950",
      "quantity": 1,
      "price": 120.50,
      "total": 120.50,
      "currency": "STP",
      "status": "pending",
      "createdAt": "2023-05-15T14:35:00Z"
    },
    {
      "id": "ord_def456",
      "type": "sell",
      "stampId": "stamp_123456789",
      "stampName": "طابع بريد classic 1970",
      "quantity": 2,
      "price": 85.00,
      "total": 170.00,
      "currency": "STP",
      "status": "active",
      "listedAt": "2023-05-14T10:20:00Z"
    }
  ]
}
```

### 6. إلغاء طلب | Cancel Order | Auftrag stornieren

**POST** `/api/marketplace/orders/{orderId}/cancel`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| orderId | string | نعم | معرّف الطلب |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/marketplace/orders/ord_abc123/cancel   -H "Content-Type: application/json"
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "orderId": "ord_abc123",
  "status": "cancelled",
  "cancelledAt": "2023-05-15T15:00:00Z",
  "message": "تم إلغاء الطلب بنجاح"
}
```

## كود حالة الاستجابة | HTTP Status Codes | HTTP-Statuscodes

| الكود | الوصف |
|------|------|
| 200 | نجاح الطلب |
| 201 | تم إنشاء الطلب بنجاح |
| 400 | معاملات غير صحيحة |
| 401 | غير مصرح به |
| 403 | ممنوع |
| 404 | الطابع أو الطلب غير موجود |
| 409 | تعارض (مثلاً: رصيد غير كافٍ) |
| 500 | خطأ داخلي في الخادم |

## أخطاء شائعة | Common Errors | Häufige Fehler

### خطأ: رصيد غير كافٍ | Error: Insufficient Balance | Fehler: Unzureichendes Guthaben

```
{
  "success": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "رصيد المحفظة غير كافٍ لإتمام عملية الشراء"
}
```

**الحل**: التحقق من رصيد المحفظة قبل إجراء أي عملية شراء.

### خطأ: الطابع غير متوفر | Error: Stamp Not Available | Fehler: Marke nicht verfügbar

```
{
  "success": false,
  "error": "STAMP_NOT_AVAILABLE",
  "message": "الطابع غير متوفر للشراء في الوقت الحالي"
}
```

**الحل**: انتظر حتى يتم إعادة توفر الطابع أو اختر طابعًا آخر.

### خطأ: طلب مكرر | Error: Duplicate Order | Fehler: Duplikatauftrag

```
{
  "success": false,
  "error": "DUPLICATE_ORDER",
  "message": "لديك طلب نشط مكرر لنفس الطابع"
}
```

**الحل**: إما انتظر حتى يتم تنفيذ الطلب الحالي أو ألغه قبل إنشاء طلب جديد.

## مثال تطبيقي | Practical Example | Praktisches Beispiel

```javascript
// مثال JavaScript لعرض قائمة الطوابع
const getStamps = async (category = '', page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      category,
      page,
      limit
    });

    const response = await fetch(`https://api.stampcoin.com/api/marketplace/stamps?${params}`);

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم جلب قائمة الطوابع بنجاح');
      return data.stamps;
    } else {
      throw new Error(data.message || 'فشل جلب قائمة الطوابع');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return [];
  }
};

// مثال JavaScript لإنشاء طلب شراء
const createBuyOrder = async (stampId, quantity, price, walletId) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/marketplace/orders/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stampId,
        quantity,
        price,
        walletId
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم إنشاء طلب الشراء بنجاح:', data.orderId);
      return data.orderId;
    } else {
      throw new Error(data.message || 'فشل إنشاء طلب الشراء');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript لإلغاء طلب
const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`https://api.stampcoin.com/api/marketplace/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم إلغاء الطلب بنجاح');
      return true;
    } else {
      throw new Error(data.message || 'فشل إلغاء الطلب');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return false;
  }
};
```

## الأمان | Security | Sicherheit

- جميع نقاط النهاية تتطلب JWT صالح في رأس الطلب: `Authorization: Bearer <token>`
- يجب استخدام HTTPS في جميع الاتصالات
- يجب التحقق من صلاحية المستخدم قبل تنفيذ أي عملية
- يجب التحقق من رصيد المحفظة قبل تنفيذ أي عملية شراء أو بيع
