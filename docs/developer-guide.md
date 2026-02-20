# 🛠️ دليل المطورين | Developer Guide | Entwicklerhandbuch

مرشد شامل للمطورين الجدد والمساهمين في مشروع Stampcoin Platform.

## إعداد بيئة التطوير | Setting Up Development Environment | Entwicklungsumgebung einrichten

### المتطلبات الأساسية | Prerequisites | Voraussetzungen

- Node.js 18.x أو أحدث
- npm أو yarn
- Git
- MongoDB (محلي أو سحابي)
- Docker (اختياري)

### الخطوات | Steps | Schritte

1. **استنسخ المستودع**:
   ```bash
   git clone https://github.com/zedanazad43/stp.git
   cd stp
   ```

2. **تثبيت الاعتماديات**:
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة**:
   ```bash
   cp .env.example .env
   ```
   ثم قم بتعديل ملف .env مع إعداداتك

4. **تشغيل الخادم المحلي**:
   ```bash
   npm run dev
   ```

5. **الوصول للتطبيق**:
   افتح المتصفح على http://localhost:3000

## هيكل المشروع | Project Structure | Projektstruktur

```
stp/
├── src/                    # كود المصدر
│   ├── ai-agent-expert/    # نظام الخبير الاصطناعي
│   │   ├── index.js        # نقطة الدخل الرئيسية
│   │   ├── utils.js        # أدوات مساعدة
│   │   └── config.json     # إعدادات الوكيل
│   ├── main/               # الكود الرئيسي للتطبيق
│   │   ├── controllers/    # وحدات التحكم
│   │   ├── services/       # الخدمات
│   │   ├── models/         # نماذج البيانات
│   │   └── utils/          # أدوات مساعدة
│   └── test/               # اختبارات الوحدة
├── docs/                   # التوثيق
├── scripts/                # نصوص مساعدة
├── server.js               # خادم التطبيق الرئيسي
└── package.json            # الاعتماديات والإعدادات
```

## أفضل الممارسات في الكود | Code Best Practices | Code-Best Practices

### 1. تسمية المتغيرات والوظائف | Variable and Function Naming | Variablen- und Funktionsnamen

- استخدم camelCase للوظائف والمتغيرات: `getUserData`
- استخدم PascalCase للفئات: `UserProfile`
- استخدم UPPER_CASE للثوابت: `API_VERSION`

### 2. هيكل الكود | Code Structure | Code-Struktur

- استخدم المسافات بذكاء (4 مسافات لكل مستوى من مستويات التداخل)
- احتفظ بكل وظيفة في حدود 20-25 سطرًا
- استخدم التعليقات التوضيحية للكود المعقد

### 3. معالجة الأخطاء | Error Handling | Fehlerbehandlung

- استخدم كتل try-catch للتعامل مع الأخطاء المحتملة
- أرجع رسائل خطأ واضحة وصادقة
- سجل الأخطاء لأغراض التصحيح

### 4. الأمان | Security | Sicherheit

- لا تخزن أي بيانات حساسة في الكود المصدري
- استخدم استعلامات آنية لمنع هجمات SQL Injection
- تحقق من جميع المدخلات قبل استخدامها

## تشغيل الاختبارات | Running Tests | Tests ausführen

### أنواع الاختبارات | Test Types | Testarten

1. **اختبارات الوحدة (Unit Tests)**: اختبار كل وظيفة بشكل منفصل
2. **اختبارات التكامل (Integration Tests)**: اختبار تفاعل المكونات مع بعضها
3. **اختبارات النهاية إلى النهاية (E2E Tests)**: اختبار سيناريوهات المستخدم الكاملة

### تشغيل الاختبارات | Running Tests | Tests ausführen

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات الوحدة فقط
npm run test:unit

# تشغيل اختبارات التكامل فقط
npm run test:integration

# تشغيل اختبارات النهاية إلى النهاية
npm run test:e2e

# توليد تقرير الاختبارات
npm run test:report
```

## كتابة اختبارات جديدة | Writing New Tests | Neue Tests schreiben

### مثال على اختبار وحدة | Unit Test Example | Unit-Test-Beispiel

```javascript
const { createUser } = require('../src/services/userService');

describe('userService', () => {
  describe('createUser', () => {
    test('should create a new user with valid data', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const user = createUser(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // يجب ألا يكون كلمة المرور الأصلية مخزنة
    });

    test('should throw an error for invalid email', () => {
      const invalidUserData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!'
      };

      expect(() => createUser(invalidUserData)).toThrow('Invalid email format');
    });
  });
});
```

### مثال على اختبار تكامل | Integration Test Example | Integrationstest-Beispiel

```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../src/models/user');

describe('User Integration Tests', () => {
  beforeEach(async () => {
    // تنظيف قاعدة البيانات قبل كل اختبار
    await User.deleteMany({});
  });

  test('should register a new user and create wallet', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(userData.email);

    // التحقق من إنشاء المحفظة تلقائيًا
    const walletResponse = await request(app)
      .get(`/api/wallet/balance?walletId=${response.body.user.walletId}`)
      .expect(200);

    expect(walletResponse.body.success).toBe(true);
    expect(walletResponse.body.walletId).toBe(response.body.user.walletId);
  });
});
```

## كيفية المساهمة في المشروع | How to Contribute | Wie man beiträgt

### 1. افتح تذكرة (Issue)

قبل البدء في العمل على أي ميزة أو إصلاح، يرجى:

1. التحقق من وجود تذكرة مشابهة مفتوحة
2. إنشاء تذكرة جديدة إذا لزم الأمر مع وصف واضح للمشكلة أو الميزة المطلوبة

### 2. إنشاء فرع (Branch)

1. أنشئ فرعًا جديدًا من الفرع الرئيسي (main):
   ```
   git checkout -b feature/your-feature-name
   ```

### 3. اكتب الكود وأضف الاختبارات

1. اتبع أفضل الممارسات الموضحة في هذا الدليل
2. أضف اختبارات جديدة للكود الجديد
3. تأكد من أن الاختبارات الحالية لا تزال ناجحة

### 4. قدم طلب سحب (Pull Request)

1. ادفع تغييراتك إلى فرعك:
   ```
   git push origin feature/your-feature-name
   ```
2. افتح طلب سحب من فرعك إلى الفرع الرئيسي
3. في وصف PR، اشرح التغييرات وأي مشكلات تم حلها

## أدوات التطوير | Development Tools | Entwicklungswerkzeuge

### 1. محرر الكود | Code Editor | Code-Editor

- Visual Studio Code (موصى به)
- Sublime Text
- WebStorm

### 2. إضافات مفيدة | Useful Extensions | Nützliche Erweiterungen

- ESLint: للتحقق من جودة الكود
- Prettier: لتنسيق الكود تلقائيًا
- GitLens: لإدارة Git مباشرة من المحرر
- Docker: للعمل مع الحاويات

### 3. أدوات التصحيح | Debugging Tools | Debugging-Tools

- Chrome DevTools
- Node.js Inspector
- VS Code Debugger

## إدارة الاعتماديات | Dependency Management | Abhängigkeitsverwaltung

### 1. إضافة اعتمادية جديدة | Adding a New Dependency | Neue Abhängigkeit hinzufügen

```bash
# لإضافة اعتمادية للإنتاج
npm install package-name

# لإضافة اعتمادية للتطوير فقط
npm install --save-dev package-name
```

### 2. تحديث الاعتماديات | Updating Dependencies | Abhängigkeiten aktualisieren

```bash
# تحديث جميع الاعتماديات
npm update

# تح اعتمادية معينة
npm update package-name
```

### 3. فحك أمان الاعتماديات | Checking Security | Sicherheitsprüfung

```bash
# تثبيت npm-audit
npm install -g npm-audit

# فحك أمان الاعتماديات
npm audit
npm audit fix
```

## نشر التطبيق | Deploying the Application | Anwendung bereitstellen

### 1. بناء التطبيق | Building the Application | Anwendung bauen

```bash
# بناء التطبيق للإنتاج
npm run build
```

### 2. تشغيل في بيئة الإنتاج | Running in Production | Produktion ausführen

```bash
# تشغيل في بيئة الإنتاج
npm start
```

### 3. استخدام Docker | Using Docker | Docker verwenden

```bash
# بناء صورة Docker
docker build -t stampcoin-platform .

# تشغيل الحاوية
docker run -p 3000:3000 stampcoin-platform
```

## استكشاف الأخطاء وإصلاحها | Troubleshooting | Fehlerbehebung

### 1. مشاكل الاتصال بقاعدة البيانات | Database Connection Issues | Datenbankverbindungsprobleme

**المشكلة**: "Failed to connect to MongoDB"

**الحل**:
- تأكد من تشغيل MongoDB
- تحقق من سلسلة الاتصال في ملف .env
- تحقق من صحة اسم المستخدم وكلمة المرور إذا كنت تستخدم MongoDB المص authenticated

### 2. مشاكل الاعتماديات | Dependency Issues | Abhängigkeitsprobleme

**المشكلة**: "Cannot find module 'package-name'"

**الحل**:
- تأكد من تثبيت الاعتماديات: `npm install`
- حاول مسح cache واعادة التثبيت: `npm cache clean --force && npm install`

### 3. مشاكل الأداء | Performance Issues | Leistungsprobleme

**المشكلة**: التطبيق بطيء أو يستغرق وقتًا طويلاً في الاستجابة

**الحل**:
- تحقق من استخدام console.log في الكود الإنتاجي
- تأكد من استخدام الفهرسة في قاعدة البيانات
- تحقق من استخدام الذاكرة المؤقتة (caching)

## الدعم والدعم | Support & Feedback | Unterstützung & Feedback

للمساعدة في عملية التطوير، يمكنك:
- فتح تذكرة في مستودع GitHub
- الانضمام إلى مناقشة في قسم Discussions
- التواصل مباشرة عبر البريد الإلكتروني: stampcoin.contact@gmail.com

## أفضل الممارسات | Best Practices | Best Practices

1. **تحقق من التغييرات**: قبل تطبيق أي تغييرات يقترحها الوكيل، راجعها بعناية.
2. **اختبار التغييرات**: قم باختبار التغييرات في بيئة التطوير قبل نشرها.
3. **المراجعة المستمرة**: راقب أداء الوكيل وفعاليته بانتظام.
4. **التغذية الراجعة**: قدم تغذية راجعة للوكيل لتحسين أدائه بمرور الوقت.

## الإصدار | Version | Version

الإصدار الحالي: 1.0.0

## الترخيص | License | Lizenz

هذا المشروع مرخص بموجب ترخيص MIT.
