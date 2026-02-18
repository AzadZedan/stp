# نشر منصة ستامبكوين على Cloudflare

هذا الدليل يوضح كيفية نشر منصة ستامبكوين على Cloudflare Pages أو Workers.

## المتطلبات الأساسية

- حساب على Cloudflare
- مستودع على GitHub يحتوي على الكود
- Wrangler CLI (لتوزيع Workers)

## الخيارات المتاحة للنشر

### خيار 1: استخدام Cloudflare Pages (موصى به)

Cloudflare Pages هو خدمة استضافة ثابتة مثالية لتطبيقات الويب.

#### الخطوات:

1. **تسجيل الدخول إلى حساب Cloudflare**:
   - اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com)
   - سجل الدخول باستخدام حسابك zedanazad43@gmail.com

2. **إنشاء مشروع جديد في Pages**:
   - في القائمة الجانبية، اختر "Pages"
   - انقر على "Create a project"
   - اختر "Connect to Git" واربط مستودع stampcoin-platform

3. **تكوين المشروع**:
   - Build command: `npm run build`
   - Build output directory: `.`
   - Root directory: `/`

4. **تكوين النطاق**:
   - بعد اكتمال البناء، انتقل إلى علامة التبويب "Custom domains"
   - أضف نطاقك: `ecostamp.net`
   - اختر خطة النشر (Free أو Pro حسب احتياجاتك)

5. **تكوين DNS**:
   - في قسم DNS في لوحة تحكم Cloudflare، تأكد من وجود سجلات A أو CNAME تشير إلى خوادم Cloudflare:
     - `ecostamp.net` (A) - يشير إلى IP الخادم
     - `www.ecostamp.net` (CNAME) - يشير إلى `ecostamp.net`

### خيار 2: استخدام Cloudflare Workers

Cloudflare Workers مناسب لتطبيقات API والخدمات الصغيرة.

#### الخطوات:

1. **تثبيت Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **تسجيل الدخول إلى حساب Cloudflare**:
   ```bash
   wrangler login
   ```

3. **تحديث wrangler.toml**:
   - افتح ملف `wrangler.toml`
   - استبدل `YOUR_ACCOUNT_ID` بمعرف حسابك
   - استبدل `YOUR_KV_NAMESPACE_ID` بمعرف مساحة التخزين KV
   - استبدل `YOUR_DATABASE_ID` بمعرف قاعدة البيانات

4. **نشر التطبيق**:
   ```bash
   wrangler deploy
   ```

### خيار 3: استخدام Cloudflare for Platforms

Cloudflare for Platforms مناسب لتطبيقات Node.js الكاملة.

#### الخطوات:

1. **تسجيل الدخول إلى حساب Cloudflare**:
   - اذهب إلى [Cloudflare Dashboard](https://dash.cloudflare.com)
   - سجل الدخول باستخدام حسابك zedanazad43@gmail.com

2. **إنشاء تطبيق جديد**:
   - في القائمة الجانبية، اختر "Cloudflare for Platforms"
   - انقر على "Create application"

3. **اختر Node.js** كمنصة التطبيق.

4. **اربط مستودع stampcoin-platform**:
   - اضبط إعدادات البناء:
     - Build command: `npm run build`
     - Start command: `npm start`
     - Root directory: `/`

5. **تكوين النطاق**:
   - أضف النطاق `ecostamp.net`
   - اختر خطة النشر (Free أو Pro حسب احتياجاتك)

## إعدادات إضافية

### تكوين متغيرات البيئة

1. **في لوحة تحكم Cloudflare**:
   - انتقل إلى قسم "Settings" > "Environment variables"
   - أضف المتغيرات اللازمة مثل:
     - `NODE_ENV=production`
     - `DB_HOST=your-database-host`
     - `DB_NAME=your-database-name`
     - `DB_USER=your-database-user`
     - `DB_PASSWORD=your-database-password`
     - `PORT=3000`

### تكوين SSL/TLS

1. **في قسم "SSL/TLS" في لوحة تحكم Cloudflare**
2. **اختر وضع "Full (strict)" للحصول على أقصى درجات الأمان**

### تكوين الأداء

1. **في قسم "Speed" في لوحة تحكم Cloudflare**
2. **قم بتمكين "Auto Minify" لـ CSS, HTML, و JavaScript**
3. **قم بتمكين "Brotli" للضغط**

### تكوين الأمان

1. **في قسم "Security" في لوحة تحكم Cloudflare**
2. **قم بتمكين "Always Use HTTPS"**
3. **قم بتمكين "WAF" (Web Application Firewall)**

## مراقبة الأداء

بعد النشر، يمكنك مراقبة أداء التطبيق باستخدام:

1. **Cloudflare Analytics**:
   - عرض الزيارات والوقت المستغرق والبيانات المنقولة

2. **Cloudflare Logs**:
   - عرض سجلات الأخطاء والطلبات

3. **Cloudflare Workers Dashboard** (إذا استخدمت Workers):
   - عرض استخدام الذاكرة والمعالج

## تحديث التطبيق

لتحديث التطبيق:

1. **إذا استخدمت Pages**:
   - قم بإجراء تغييرات في الكود
   - قم بعمل commit و push إلى المستودع
   - سيتم بناء ونشر التغييرات تلقائياً

2. **إذا استخدمت Workers**:
   - قم بإجراء تغييرات في الكود
   - قم بعمل commit و push إلى المستودع
   - نفذ `wrangler deploy` مرة أخرى

3. **إذا استخدمت Cloudflare for Platforms**:
   - قم بإجراء تغييرات في الكود
   - قم بعمل commit و push إلى المستودع
   - سيتم بناء ونشر التغييرات تلقائياً

## استكشاف الأخطاء وإصلاحها

### مشاكل شائعة

1. **خطأ في البناء**:
   - تأكد من وجود ملف package.json
   - تأكد من وجود جميع التبعيات في ملف package.json
   - تأكد من أن إعدادات البناء صحيحة

2. **مشاكل الاتصال بال API**:
   - تأكد من أن متغيرات البيئة مضبوطة بشكل صحيح
   - تأكد من أن نقاط النهاية تعمل بشكل صحيح

3. **مشاكل الأداء**:
   - تأكد من تمكين التخزين المؤقت في Cloudflare
   - تأكد من تحسين الصور والأصول

### الحصول على المساعدة

إواجهت مشكلة؟ يمكنك:

1. **التحقق من سجلات Cloudflare** للعثور على الأخطاء
2. **مراجعة توثيق Cloudflare** للحصول على إرشادات إضافية
3. **فتح issue** في مستودع stampcoin-platform

## خاتمة

باتباع هذه الخطوات، يجب أن يكون تطبيق منصة ستامبكوين منشوراً بنجاح على نطاقك ecostamp.net وجاهزاً للاستخدام. إذا واجهت أي مشاكل، يمكنك دائماً الرجوع إلى هذا الدليل أو طلب المساعدة من فريق الدعم.
