# مرجع واجهة برمجة التطبيقات (API) لـ Stampcoin Platform

هذا المستند يوفر وصفاً تفصيلياً لواجهة برمجة التطبيقات المتاحة في Stampcoin Platform.

## نظرة عامة

توفر واجهة برمجة التطبيقات RESTful للوصول إلى وظائف منصة Stampcoin Platform. جميع الطلبات تستخدم JSON كتنسيق للبيانات، والردود تكون بتنسيق JSON أيضاً.

## نقاط النهاية (Endpoints)

### 1. نقطة نهاية الحالة

**الحصول على حالة الخادم**

- **الطريقة:** GET
- **المسار:** `/api/status`
- **الوصف:** يرجع حالة الخادم مع معلومات حول الإصدار والوقت الحالي

**الطلب:**
```bash
curl http://localhost:3000/api/status
```

**الرد:**
```json
{
  "status": "running",
  "timestamp": "2026-02-17T12:00:00.000Z",
  "version": "2.0.0"
}
```

### 2. نقاط نهاية المعاملات

**إنشاء معاملة جديدة**

- **الطريقة:** POST
- **المسار:** `/api/transaction`
- **الوصف:** ينشئ معاملة جديدة في النظام

**الطلب:**
```bash
curl -X POST http://localhost:3000/api/transaction   -H "Content-Type: application/json"   -d '{
    "amount": 100,
    "currency": "STAMP",
    "recipient": "0x1234567890abcdef1234567890abcdef12345678",
    "sender": "0xabcdef1234567890abcdef1234567890abcdef12"
  }'
```

**الرد:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_1234567890",
    "amount": 100,
    "currency": "STAMP",
    "recipient": "0x1234567890abcdef1234567890abcdef12345678",
    "sender": "0xabcdef1234567890abcdef1234567890abcdef12",
    "status": "pending",
    "timestamp": "2026-02-17T12:00:00.000Z"
  }
}
```

**الحصول على قائمة بالمعاملات**

- **الطريقة:** GET
- **المسار:** `/api/transactions`
- **الوصف:** يرجع قائمة بالمعاملات مع دعم التصفية والترتيب

**الطلب:**
```bash
curl "http://localhost:3000/api/transactions?limit=10&status=completed"
```

**الرد:**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "tx_1234567890",
      "amount": 100,
      "currency": "STAMP",
      "recipient": "0x1234567890abcdef1234567890abcdef12345678",
      "sender": "0xabcdef1234567890abcdef1234567890abcdef12",
      "status": "completed",
      "timestamp": "2026-02-17T12:00:00.000Z"
    },
    // ... المزيد من المعاملات
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

**الحصول على تفاصيل معاملة محددة**

- **الطريقة:** GET
- **المسار:** `/api/transactions/:id`
- **الوصف:** يرجع تفاصيل معاملة معينة بناءً على معرفها

**الطلب:**
```bash
curl http://localhost:3000/api/transactions/tx_1234567890
```

**الرد:**
```json
{
  "success": true,
  "transaction": {
    "id": "tx_1234567890",
    "amount": 100,
    "currency": "STAMP",
    "recipient": "0x1234567890abcdef1234567890abcdef12345678",
    "sender": "0xabcdef1234567890abcdef1234567890abcdef12",
    "status": "completed",
    "timestamp": "2026-02-17T12:00:00.000Z",
    "details": {
      "blockNumber": 12345,
      "gasUsed": 21000,
      "confirmations": 12
    }
  }
}
```

## رموز الخطأ

| الرمز | الوصف |
|------|-------|
| 400 | طلب غير صالح |
| 401 | غير مصرح به |
| 403 | ممنوع |
| 404 | غير موجود |
| 429 | عدد كبير جداً من الطلبات |
| 500 | خطأ داخلي في الخادم |

## مثال على عميل بسيط

```javascript
const axios = require('axios');

// إنشاء معاملة جديدة
async function createTransaction(transactionData) {
  try {
    const response = await axios.post('http://localhost:3000/api/transaction', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error.response.data);
    throw error;
  }
}

// الحصول على قائمة بالمعاملات
async function getTransactions(params = {}) {
  try {
    const response = await axios.get('http://localhost:3000/api/transactions', {
      params: params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error.response.data);
    throw error;
  }
}

// استخدام الدوال
(async () => {
  try {
    // إنشاء معاملة
    const newTx = await createTransaction({
      amount: 100,
      currency: 'STAMP',
      recipient: '0x1234567890abcdef1234567890abcdef12345678',
      sender: '0xabcdef1234567890abcdef1234567890abcdef12'
    });
    console.log('New transaction:', newTx);

    // الحصول على المعاملات
    const transactions = await getTransactions({ limit: 10, status: 'pending' });
    console.log('Transactions:', transactions);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```
