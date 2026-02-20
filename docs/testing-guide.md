# 🧪 Testing Guide | دليل الاختبارات | Testhandbuch

مرشد شامل لعملية الاختبار في مشروع Stampcoin Platform.

## نظرة عامة | Overview | Übersicht

يغطي هذا الدليل جميع جوانب عملية الاختبار في المشروع، بما في ذلك اختبارات الوحدة، اختبارات التكامل، واختبارات النهاية إلى النهاية.

## أنواع الاختبارات | Test Types | Testarten

### 1. اختبارات الوحدة (Unit Tests) | Unit Tests | Unit-Tests

اختبار كل وظيفة أو مكون بشكل منفصل لضمان عمله بشكل صحيح.

**المميزات**:
- سريعة التنفيذ
 сосطة في تحديد المشاكل
 سهلة الكتابة والصيانة

**الأدوات المستخدمة**:
- Jest للإطار الرئيسي
- Supertest لاختبارات API

**مثال**:
```javascript
const { calculateTotal } = require('../src/utils/calculator');

describe('calculateTotal', () => {
  test('should correctly calculate total price', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ];

    const total = calculateTotal(items);
    expect(total).toBe(35);
  });
});
```

### 2. اختبارات التكامل (Integration Tests) | Integration Tests | Integrationstests

اختبار تفاعل المكونات مع بعضها البعض لضمان أن تعمل معًا بشكل صحيح.

**المميزات**:
- أبطأ من اختبارات الوحدة
- تكتشف المشاكل في التفاعل بين المكونات
- تغطي تدفق البيانات بين الوحدات

**الأدوات المستخدمة**:
- Jest
- Supertest
- MongoDB Memory Server

**مثال**:
```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../src/models/user');

describe('User Registration Integration', () => {
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
  });
});
```

### 3. اختبارات النهاية إلى النهاية (E2E Tests) | End-to-End Tests | End-to-End-Tests

اختبار سيناريوهات المستخدم الكاملة من البداية إلى النهاية.

**المميزات**:
- تغطي تدفق المستخدم بالكامل
- أبطأ نوع من الاختبارات
- تشبه سلوك المستخدم الحقيقي

**الأدوات المستخدمة**:
- Cypress
- Puppeteer

**مثال**:
```javascript
describe('User Registration Flow', () => {
  it('should allow a user to register and login', () => {
    cy.visit('/register');

    cy.get('#username').type('testuser');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('Password123!');
    cy.get('#firstName').type('Test');
    cy.get('#lastName').type('User');

    cy.get('form').submit();

    cy.url().should('include', '/dashboard');
    cy.contains('مرحباً بك، Test!').should('be.visible');

    // تسجيل الخروج
    cy.get('#logout-button').click();

    // تسجيل الدخول
    cy.visit('/login');
    cy.get('#email').type('test@example.com');
    cy.get('#password').type('Password123!');
    cy.get('form').submit();

    cy.url().should('include', '/dashboard');
  });
});
```

## هيكل الاختبارات | Test Structure | Teststruktur

```
tests/
├── unit/                  # اختبارات الوحدة
│   ├── controllers/      # اختبارات وحدات التحكم
│   ├── services/         # اختبارات الخدمات
│   ├── models/           # اختبارات النماذج
│   └── utils/            # اختبارات الأدوات
├── integration/          # اختبارات التكامل
│   ├── auth/             # اختبارات نظام المصادقة
│   ├── wallet/           # اختبارات نظام المحفظة
│   └── marketplace/      # اختبارات نظام السوق
└── e2e/                 # اختبارات النهاية إلى النهاية
    ├── auth-flow.spec.js
    ├── wallet-flow.spec.js
    └── marketplace-flow.spec.js
```

## كيفية تشغيل الاختبارات | Running Tests | Tests ausführen

### 1. تشغيل جميع الاختبارات | Running All Tests | Alle Tests ausführen

```bash
npm test
```

### 2. تشغيل اختبارات الوحدة فقط | Running Unit Tests Only | Nur Unit-Tests ausführen

```bash
npm run test:unit
```

### 3. تشغيل اختبارات التكامل فقط | Running Integration Tests Only | Nur Integrationstests ausführen

```bash
npm run test:integration
```

### 4. تشغيل اختبارات النهاية إلى النهاية فقط | Running E2E Tests Only | Nur E2E-Tests ausführen

```bash
npm run test:e2e
```

### 5. توليد تقرير الاختبارات | Generating Test Report | Testbericht generieren

```bash
npm run test:report
```

## أفضل الممارسات في الاختبارات | Testing Best Practices | Test-Best Practices

### 1. اكتب اختبارات قابلة للقراءة | Write Readable Tests | Lesbare Tests schreiben

- استأسم اختباراتك بوضوح
- استخدم التعليقات لتوضيح الاختبارات المعقدة
- قسّم الاختبارات إلى مجموعات منطقية

```javascript
describe('User Service', () => {
  describe('createUser', () => {
    test('should create a new user with valid data', () => {
      // اختبار إنشاء مستخدم ببيانات صالحة
    });

    test('should throw error for invalid email', () => {
      // اختبار معالجة البريد الإلكتروني غير الصالح
    });
  });
});
```

### 2. استخدم بيانات الاختبار المناسبة | Use Appropriate Test Data | Geeignete Testdaten verwenden

- استخدم بيانات اختبار قابلة للتكرار
- تجنب البيانات الحساسة في الاختبارات
- استخدم أدوات مثل Faker لتوليد بيانات عشوائية

```javascript
const { faker } = require('@faker-js/faker');

const userData = {
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(12),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName()
};
```

### 3. قم باختبار الحالات الإيجابية والسلبية | Test Positive and Negative Cases | Positive und negative Fälle testen

- اختبار الحالات الصحيحة (الإدخال الصالح)
- اختبار الحالات غير الصحيحة (الإدخال غير الصالح)
- اختبار الحادر الحدية (الحدود القصوى والدنيا)

```javascript
describe('Password Validation', () => {
  test('should accept valid password', () => {
    expect(isValidPassword('SecurePassword123!')).toBe(true);
  });

  test('should reject password without uppercase', () => {
    expect(isValidPassword('password123!')).toBe(false);
  });

  test('should reject password without number', () => {
    expect(isValidPassword('SecurePassword!')).toBe(false);
  });

  test('should reject password shorter than 8 characters', () => {
    expect(isValidPassword('Short1!')).toBe(false);
  });
});
```

### 4. قم باختبار الأخطاء بشكل صحيح | Test Errors Properly | Fehler korrekt testen

- تأكد من أن الأخطاء يتم طرحها بشكل صحيح
- اختبار رسائل الخطأ المناسبة
- تأكد من أن الأخطاء تتم معالجتها بشكل صحيح

```javascript
test('should throw error for duplicate email', async () => {
  // إنشاء مستخدم أول
  await createUser({
    email: 'test@example.com',
    username: 'user1',
    password: 'Password123!'
  });

  // محاولة إنشاء مستخدم بنفس البريد الإلكتروني
  await expect(createUser({
    email: 'test@example.com',
    username: 'user2',
    password: 'Password123!'
  })).rejects.toThrow('Email already exists');
});
```

## اختبارات API | API Testing | API-Tests

### 1. اختبارات API باستخدام Supertest | API Tests with Supertest | API-Tests mit Supertest

```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication API', () => {
  test('should register a new user', async () => {
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
  });

  test('should not register user with duplicate email', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };

    // إنشاء المستخدم الأول
    await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    // محاولة إنشاء مستخدم بنفس البريد الإلكتروني
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });
});
```

### 2. اختبارات API باستخدام Jest | API Tests with Jest | API-Tests mit Jest

```javascript
const axios = require('axios');

describe('Wallet API', () => {
  let authToken;
  let walletId;

  beforeAll(async () => {
    // تسجيل مستخدم جديد والحصول على التوكن
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'Password123!'
    });

    authToken = loginResponse.data.token;

    // إنشاء محفظة جديدة
    const walletResponse = await axios.post('http://localhost:3000/api/wallet/create', {
      userId: 'testuser',
      currency: 'STP'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    walletId = walletResponse.data.walletId;
  });

  test('should get wallet balance', async () => {
    const response = await axios.get(`http://localhost:3000/api/wallet/balance?walletId=${walletId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.walletId).toBe(walletId);
  });
});
```

## اختبارات قاعدة البيانات | Database Testing | Datenbanktests

### 1. استخدام MongoDB Memory Server | Using MongoDB Memory Server | MongoDB Memory Server verwenden

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/user');

describe('User Model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات قبل كل اختبار
    await User.deleteMany({});
  });

  test('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.email).toBe(userData.email);
  });
});
```

### 2. اختبارات المعاملات | Transaction Testing | Transaktionstests

```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/user');
const Wallet = require('../src/models/wallet');

describe('Wallet Transactions', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('should transfer stamps between wallets', async () => {
    // إنشاء مستخدمين ومحافظ
    const user1 = new User({
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashedpassword'
    });
    await user1.save();

    const user2 = new User({
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashedpassword'
    });
    await user2.save();

    const wallet1 = new Wallet({
      userId: user1.id,
      balance: 10,
      currency: 'STP'
    });
    await wallet1.save();

    const wallet2 = new Wallet({
      userId: user2.id,
      balance: 5,
      currency: 'STP'
    });
    await wallet2.save();

    // تنفيذ عملية التحويل
    const transferAmount = 3;
    wallet1.balance -= transferAmount;
    wallet2.balance += transferAmount;

    await wallet1.save();
    await wallet2.save();

    // التحقق من النتائج
    const updatedWallet1 = await Wallet.findById(wallet1.id);
    const updatedWallet2 = await Wallet.findById(wallet2.id);

    expect(updatedWallet1.balance).toBe(7);
    expect(updatedWallet2.balance).toBe(8);
  });
});
```

## اختبارات الأداء | Performance Testing | Leistungstests

### 1. اختبارات الأداء باستخدام Jest | Performance Tests with Jest | Leistungstests mit Jest

```javascript
const axios = require('axios');

describe('Performance Tests', () => {
  test('should handle 100 concurrent requests', async () => {
    const requests = [];

    for (let i = 0; i < 100; i++) {
      requests.push(
        axios.get('http://localhost:3000/api/health')
      );
    }

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    const totalTime = endTime - startTime;
    const averageTime = totalTime / 100;

    expect(responses.every(res => res.status === 200)).toBe(true);
    expect(averageTime).toBeLessThan(100); // متوسط وقت الاستجابة أقل من 100 مللي ثانية
  }, 30000); // زيادة وقت المهلة إلى 30 ثانية
});
```

### 2. اختبارات الحمل باستخدام Artillery | Load Testing with Artillery | Lasttests mit Artillery

```javascript
// ملف اختبار Artillery: load-test.yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Normal Load"

  scenarios:
    - flow:
      - get:
          url: "/api/health"
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "Password123!"
          capture:
            - json: "$.token"
              as: "authToken"
      - get:
          url: "/api/wallet/balance"
          headers:
            Authorization: "Bearer {{authToken}}"

# تشغيل الاختبار
npx artillery run load-test.yaml
```

## توليد تقرير الاختبارات | Generating Test Reports | Testberichte generieren

### 1. تقرير Jest | Jest Report | Jest-Bericht

```bash
# توليد تقرير HTML
npm run test:report

# توليد تقرير cobertura
npm run test:coverage
```

### 2. تقرير Cypress | Cypress Report | Cypress-Bericht

```bash
# توليد تقرير HTML
npm run test:e2e:report
```

## استكشاف الأخطاء وإصلاحها | Troubleshooting | Fehlerbehebung

### 1. مشاكل الاختبارات | Test Issues | Testprobleme

**المشكلة**: الاختبارات تفشل بشكل عشوائي

**الحل**:
- تأكد من تنظيف قاعدة البيانات قبل كل اختبار
- استخدم setTimeout أو waitFor في اختبارات E2E للتعامل مع التزامن
- تأكد من أن جميع العمليات غير المتزامنة (async/await) معالجة بشكل صحيح

**المشكلة**: اختبارات الوحدة بطيئة جدًا

**الحل**:
- استخدام mocks للوحدات الخارجية
- تقليل عدد الاختبارات التي تتصل بقاعدة البيانات
- استخدام Jest mocks للوظائف الخارجية

### 2. تحسينات الاختبارات | Test Improvements | Testverbesserungen

**المشكلة**: تغطية الاختبارات منخفضة

**الحل**:
- إضافة المزيد من حالات الاختبار
- التركيز على الكود المعقد والهام
- استخدام أدوات مثل Istanbul لتحليل التغطية

**المشكلة**: صعوبة فهم أخطاء الاختبارات

**الحل**:
- استخدام أسماء اختبارات أكثر وضوحًا
- إضافة تعليقات توضيحية للكود المعقد
- تنظيف مخرجات الاختبارات

## أفضل الممارسات | Best Practices | Best Practices

1. **اختبارات قابلة للتكرار**: تأكد أن الاختبارات تعمل بنفس النتائج في كل مرة.
2. **اختبارات مستقلة**: كل اختبار يجب أن يعمل بشكل مستقل دون الاعتماد على الاختبارات الأخرى.
3. **اختبارات سريعة**: اختبارات الوحدة يجب أن تكون سريعة، بينما يمكن أن تكون اختبارات التكامل والإتاحة أبطأ.
4. **اختبارات شاملة**: غطي جميع الحالات المهمة، بما في ذلك الحالات الإيجابية والسلبية.
5. **صيانة الاختبارات**: قم بتحديث الاختبارات مع تغيير الكود لتبقى ذات صلة.

## الدعم والدعم | Support & Feedback | Unterstützung & Feedback

للمساعدة في عملية الاختبار، يمكنك:
- فتح تذكرة في مستودع GitHub
- الانضمام إلى مناقشة في قسم Discussions
- التواصل مباشرة عبر البريد الإلكتروني: stampcoin.contact@gmail.com

## الإصدار | Version | Version

الإصدار الحالي: 1.0.0

## الترخيص | License | Lizenz

هذا المشروع مرخص بموجب ترخيص MIT.
