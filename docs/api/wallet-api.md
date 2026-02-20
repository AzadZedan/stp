# 🏦 Wallet API | واجهة برمجة المحفظة | Wallet API

توثيق تفصيلي لواجهة برمجة تطبيقات نظام المحفظة الرقمية في Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يوفر نظام المحفظة واجهات برمجة لتخزين وإدارة وإرسال الطوابع الرقمية بشكل آمن.

## نقاط النهاية الرئيسية | Main Endpoints | Hauptendpunkte

### 1. إنشاء محفظة جديدة | Create New Wallet | Neue Wallet erstellen

**POST** `/api/wallet/create`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| userId | string | نعم | معرّف المستخدم |
| currency | string | لا | العملة الافتراضية (افتراضي: STP) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/wallet/create   -H "Content-Type: application/json"   -d '{"userId": "user123", "currency": "STP"}'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "walletId": "wal_123456789",
  "address": "0x742d35Cc6634C0532925a3b8D6C2C5Dc3D2e1F4A",
  "balance": 0,
  "currency": "STP"
}
```

### 2. الحصول على رصيد المحفظة | Get Wallet Balance | Wallet-Saldo abrufen

**GET** `/api/wallet/balance`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| walletId | string | نعم | معرّف المحفظة |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET https://api.stampcoin.com/api/wallet/balance?walletId=wal_123456789
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "walletId": "wal_123456789",
  "balance": 5.75,
  "currency": "STP",
  "lastUpdated": "2023-05-15T14:30:00Z"
}
```

### 3. إيداع طوابع | Deposit Stamps | Einlagen

**POST** `/api/wallet/deposit`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| walletId | string | نعم | معرّف المحفظة |
| stampId | string | نعم | معرّف الطابع |
| quantity | number | نعم | الكمية |
| transactionId | string | نعم | معرّف المعاملة |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/wallet/deposit   -H "Content-Type: application/json"   -d '{
    "walletId": "wal_123456789",
    "stampId": "stamp_987654321",
    "quantity": 5,
    "transactionId": "txn_abc123"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "walletId": "wal_123456789",
  "stampId": "stamp_987654321",
  "quantity": 5,
  "newBalance": 5.75,
  "transactionId": "txn_abc123"
}
```

### 4. سحب طوابع | Withdraw Stamps | Abhebungen

**POST** `/api/wallet/withdraw`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| walletId | string | نعم | معرّف المحفظة |
| stampId | string | نعم | معرّف الطابع |
| quantity | number | نعم | الكمية |
| recipientAddress | string | نعم | عنوان المستلم |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/wallet/withdraw   -H "Content-Type: application/json"   -d '{
    "walletId": "wal_123456789",
    "stampId": "stamp_987654321",
    "quantity": 2,
    "recipientAddress": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6a063"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "walletId": "wal_123456789",
  "stampId": "stamp_987654321",
  "quantity": 2,
  "remainingBalance": 3.75,
  "transactionId": "txn_def456"
}
```

### 5. الحصول على سجل المعاملات | Get Transaction History | Transaktionsverlauf

**GET** `/api/wallet/transactions`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| walletId | string | نعم | معرّف المحفظة |
| page | number | لا | رقم الصفحة (افتراضي: 1) |
| limit | number | لا | عدد النتائج لكل صفحة (افتراضي: 20) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET https://api.stampcoin.com/api/wallet/transactions?walletId=wal_123456789&page=1&limit=10
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "walletId": "wal_123456789",
  "page": 1,
  "limit": 10,
  "totalTransactions": 25,
  "transactions": [
    {
      "id": "txn_abc123",
      "type": "deposit",
      "stampId": "stamp_987654321",
      "quantity": 5,
      "timestamp": "2023-05-15T14:30:00Z",
      "status": "completed"
    },
    {
      "id": "txn_def456",
      "type": "withdraw",
      "stampId": "stamp_987654321",
      "quantity": 2,
      "timestamp": "2023-05-14T10:15:00Z",
      "status": "completed"
    }
  ]
}
```

## كود حالة الاستجابة | HTTP Status Codes | HTTP-Statuscodes

| الكود | الوصف |
|------|------|
| 200 | نجاح الطلب |
| 201 | تم إنشاء المحفظة بنجاح |
| 400 | معاملات غير صحيحة |
| 401 | غير مصرح به |
| 403 | ممنوع |
| 404 | المحفظة غير موجودة |
| 500 | خطأ داخلي في الخادم |

## أخطاء شائعة | Common Errors | Häufige Fehler

### خطأ: محفظة غير موجودة | Error: Wallet Not Found | Fehler: Wallet nicht gefunden

```
{
  "success": false,
  "error": "WALLET_NOT_FOUND",
  "message": "المحفظة المحددة غير موجودة"
}
```

**الحل**: التحقق من صحة معرّف المحفظة وتأكده من وجوده في النظام.

### خطأ: رصيد غير كافٍ | Error: Insufficient Balance | Fehler: Unzureichendes Guthaben

```
{
  "success": false,
  "error": "INSUFFICIENT_BALANCE",
  "message": "الرصيد غير كافٍ لإتمام هذه العملية"
}
```

**الحل**: التحقق من رصيد المحفظة قبل إجراء أي عملية سحب.

### خطأ: معاملة غير صالحة | Error: Invalid Transaction | Fehler: Ungültige Transaktion

```
{
  "success": false,
  "error": "INVALID_TRANSACTION",
  "message": "المعلمة المحددة غير صالحة"
}
```

**الحل**: التحقق من صحة جميع المعاملات قبل إرسال الطلب.

## مثال تطبيقي | Practical Example | Praktisches Beispiel

```javascript
// مثال JavaScript لإنشاء محفظة جديدة
const createWallet = async (userId) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/wallet/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        currency: 'STP'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('تم إنشاء المحفظة بنجاح:', data.walletId);
      return data.walletId;
    } else {
      console.error('فشل إنشاء المحفظة:', data.message);
      return null;
    }
  } catch (error) {
    console.error('خطأ في الاتصال بالخادم:', error);
    return null;
  }
};

// مثال JavaScript لإيداع طوابع
const depositStamps = async (walletId, stampId, quantity) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/wallet/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletId: walletId,
        stampId: stampId,
        quantity: quantity,
        transactionId: `txn_${Date.now()}`
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('تم إيداع الطوابع بنجاح');
      return true;
    } else {
      console.error('فشل إيداع الطوابع:', data.message);
      return false;
    }
  } catch (error) {
    console.error('خطأ في الاتصال بالخادم:', error);
    return false;
  }
};
```

## الأمان | Security | Sicherheit

- جميع نقاط النهاية تتطلب JWT صالح في رأس الطلب: `Authorization: Bearer <token>`
- يجب استخدام HTTPS في جميع الاتصالات
- لا يجب تخزين بيانات الاعتماد (tokens) في الكود المصدري
