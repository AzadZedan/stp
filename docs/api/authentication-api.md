# 🔐 Authentication API | واجهة برمجة المصادقة | Authentifizierungs-API

توثيق تفصيلي لواجهة برمجة تطبيقات نظام المصادقة في Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يوفر نظام المصادقة واجهات برمجة لتسجيل الدخول، إدارة الجلسات، والمصادقة الثنائية.

## نقاط النهاية الرئيسية | Main Endpoints | Hauptendpunkte

### 1. تسجيل مستخدم جديد | Register New User | Neuen Benutzer registrieren

**POST** `/api/auth/register`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| username | string | نعم | اسم المستخدم |
| email | string | نعم | البريد الإلكتروني |
| password | string | نعم | كلمة المرور |
| firstName | string | نعم | الاسم الأول |
| lastName | string | نعم | الاسم الأخير |
| country | string | لا | البلد |
| language | string | لا | اللغة المفضلة (ar, en, de) |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/register   -H "Content-Type: application/json"   -d '{
    "username": "user123",
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "محمد",
    "lastName": "أحمد",
    "country": "مصر",
    "language": "ar"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "userId": "usr_123456789",
  "username": "user123",
  "email": "user@example.com",
  "firstName": "محمد",
  "lastName": "أحمد",
  "country": "مصر",
  "language": "ar",
  "verified": false,
  "createdAt": "2023-05-15T14:30:00Z"
}
```

### 2. تسجيل الدخول | Login | Anmeldung

**POST** `/api/auth/login`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| email | string | نعم | البريد الإلكتروني |
| password | string | نعم | كلمة المرور |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "usr_123456789",
    "username": "user123",
    "email": "user@example.com",
    "firstName": "محمد",
    "lastName": "أحمد",
    "verified": true,
    "role": "user"
  },
  "expiresAt": "2023-05-15T16:30:00Z"
}
```

### 3. تسجيل الخروج | Logout | Abmelden

**POST** `/api/auth/logout`

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/logout   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "message": "تم تسجيل الخروج بنجاح"
}
```

### 4. تحديث التوكن | Refresh Token | Token aktualisieren

**POST** `/api/auth/refresh`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| refreshToken | string | نعم | التوكن المُحدَّث |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/refresh   -H "Content-Type: application/json"   -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2023-05-15T16:30:00Z"
}
```

### 5. إعادة تعيين كلمة المرور | Reset Password | Passwort zurücksetzen

**POST** `/api/auth/reset-password`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| email | string | نعم | البريد الإلكتروني |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/reset-password   -H "Content-Type: application/json"   -d '{
    "email": "user@example.com"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
}
```

### 6. تغيير كلمة المرور | Change Password | Passwort ändern

**POST** `/api/auth/change-password`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| currentPassword | string | نعم | كلمة المرور الحالية |
| newPassword | string | نعم | كلمة المرور الجديدة |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/change-password   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "currentPassword": "SecurePassword123!",
    "newPassword": "NewSecurePassword456!"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

### 7. تفعيل الحساب | Verify Account | Konto verifizieren

**GET** `/api/auth/verify/{verificationToken}`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| verificationToken | string | نعم | رمز التفعيل |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X GET https://api.stampcoin.com/api/auth/verify/abc123xyz789
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "message": "تم تفعيل الحساب بنجاح",
  "verified": true
}
```

### 8. إعداد المصادقة الثنائية | Setup Two-Factor Authentication | Zwei-Faktor-Authentifizierung einrichten

**POST** `/api/auth/2fa/setup`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| password | string | نعم | كلمة المرور |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/2fa/setup   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "password": "SecurePassword123!"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Stampcoin:user123%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Stampcoin"
}
```

### 9. التحقق من المصادقة الثنائية | Verify Two-Factor Authentication | Zwei-Faktor-Authentifizierung verifizieren

**POST** `/api/auth/2fa/verify`

#### معاملات الطلب | Request Parameters | Anfrageparameter

| المعامل | النوع | مطلوب | الوصف |
|---------|------|-------|------|
| token | string | نعم | رمز المصادقة الثنائية |

#### مثال الطلب | Example Request | Beispiel-Anfrage

```bash
curl -X POST https://api.stampcoin.com/api/auth/2fa/verify   -H "Content-Type: application/json"   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."   -d '{
    "token": "123456"
  }'
```

#### مثال الاستجابة | Example Response | Beispiel-Antwort

```json
{
  "success": true,
  "message": "تم تفعيل المصادقة الثنائية بنجاح",
  "enabled": true
}
```

## كود حالة الاستجابة | HTTP Status Codes | HTTP-Statuscodes

| الكود | الوصف |
|------|------|
| 200 | نجاح الطلب |
| 201 | تم إنشاء المستخدم بنجاح |
| 400 | معاملات غير صحيحة |
| 401 | غير مصرح به |
| 403 | ممنوع |
| 404 | المستخدم غير موجود |
| 409 | تعارض (مثلاً: البريد الإلكتروني مستخدم مسبقًا) |
| 422 | بيانات غير صالحة |
| 500 | خطأ داخلي في الخادم |

## أخطاء شائعة | Common Errors | Häufige Fehler

### خطأ: بيانات غير صالحة | Error: Invalid Credentials | Fehler: Ungültige Anmeldeinformationen

```
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "البريد الإلكتروني أو كلمة المرور غير صحيحة"
}
```

**الحل**: تحقق من صحة البريد الإلكتروني وكلمة المرور، وتأكد من حالة لوحة المفاتيح.

### خطأ: مستخدم غير موجود | Error: User Not Found | Fehler: Benutzer nicht gefunden

```
{
  "success": false,
  "error": "USER_NOT_FOUND",
  "message": "المستخدم غير موجود"
}
```

**الحل**: تأكد من صحة البريد الإلكتروني المستخدم في عملية تسجيل الدخول.

### خطأ: توكن منتهي الصلاحية | Error: Token Expired | Fehler: Abgelaufenes Token

```
{
  "success": false,
  "error": "TOKEN_EXPIRED",
  "message": "توكن المصادقة منتهي الصلاحية"
}
```

**الحل**: قم بتسجيل الدخول مرة أخرى أو تحديث التوكن باستخدام التوكن المُحدَّث.

## مثال تطبيقي | Practical Example | Praktisches Beispiel

```javascript
// مثال JavaScript لتسجيل مستخدم جديد
const registerUser = async (userData) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم تسجيل المستخدم بنجاح:', data.userId);
      return data.userId;
    } else {
      throw new Error(data.message || 'فشل تسجيل المستخدم');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript لتسجيل الدخول
const login = async (email, password) => {
  try {
    const response = await fetch('https://api.stampcoin.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`فشل الطلب: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('تم تسجيل الدخول بنجاح');
      // حفظ التوكنات للتطبيقات اللاحقة
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.user;
    } else {
      throw new Error(data.message || 'فشل تسجيل الدخول');
    }
  } catch (error) {
    console.error('خطأ:', error);
    return null;
  }
};

// مثال JavaScript للتحقق من صلاحية التوكن
const verifyToken = async () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return false;
  }

  try {
    const response = await fetch('https://api.stampcoin.com/api/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error('خطأ:', error);
    return false;
  }
};

// مثال JavaScript لتسجيل الخروج
const logout = async () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return true;
  }

  try {
    const response = await fetch('https://api.stampcoin.com/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // مسح التوكنات المحلية
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('خطأ:', error);
    return false;
  }
};
```

## الأمان | Security | Sicherheit

- يجب استخدام HTTPS في جميع الاتصالات
- يجب التحقق من صحة جميع التوكنات قبل استخدامها
- يجب عدم مشاركة التوكنات مع أي طرف ثالث
- يجب تغيير كلمات المرور بانتظام
- يُنصح بتفعيل المصادقة الثنائية للحسابات الحساسة
