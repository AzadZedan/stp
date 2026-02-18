#!/bin/bash

# نص برمجي لإعداد وتكوين Cloudflare لمنصة ستامبكوين

echo "=== إعداد Cloudflare لمنصة ستامبكوين ==="

# التحقق من وجود Wrangler CLI
if ! command -v wrangler &> /dev/null; then
    echo "⚠️ Wrangler غير مثبت. سيتم تثبيته الآن..."
    npm install -g wrangler
fi

# تسجيل الدخول إلى Cloudflare
echo "🔑 تسجيل الدخول إلى حساب Cloudflare..."
wrangler login

# الحصول على معرف الحساب
echo "📋 جلب معرف حساب Cloudflare..."
ACCOUNT_ID=$(wrangler whoami --format json | grep -o '"account_id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ACCOUNT_ID" ]; then
    echo "❌ لم يتم العثور على معرف الحساب. يرجى التأكد من تسجيل الدخول بشكل صحيح."
    exit 1
fi
echo "✅ تم العثور على معرف الحساب: $ACCOUNT_ID"

# إنشاء مساحة تخزين KV جديدة
echo "🗄️ إنشاء مساحة تخزين KV جديدة..."
KV_ID=$(wrangler kv namespace create STAMPCOIN_KV --format json | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$KV_ID" ]; then
    echo "⚠️ لم يتم إنشاء مساحة التخزين KV. قد تكون موجودة بالفعل."
    KV_ID=$(wrangler kv namespace list --format json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "✅ معرف مساحة التخزين KV: $KV_ID"

# إنشاء قاعدة بيانات D1 جديدة
echo "🗄️ إنشاء قاعدة بيانات D1 جديدة..."
DB_ID=$(wrangler d1 create stampcoin_platform --format json | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
if [ -z "$DB_ID" ]; then
    echo "⚠️ لم يتم إنشاء قاعدة البيانات D1. قد تكون موجودة بالفعل."
    DB_ID=$(wrangler d1 list --format json | grep -o '"uuid":"[^"]*"' | head -1 | cut -d'"' -f4)
fi
echo "✅ معرف قاعدة البيانات D1: $DB_ID"

# تحديث wrangler.toml بالمعرفات الجديدة
echo "🔧 تحديث wrangler.toml بالمعرفات الجديدة..."
sed -i "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" wrangler.toml
sed -i "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" wrangler.toml
sed -i "s/YOUR_KV_PREVIEW_ID/$KV_ID/g" wrangler.toml
sed -i "s/YOUR_DATABASE_ID/$DB_ID/g" wrangler.toml

# إنشاء ملف .env مع المتغيرات اللازمة
echo "📝 إنشاء ملف .env..."
cat > .env << EOF
# متغيرات البيئة لمنصة ستامبكوين
# تم إنشاؤها بواسطة نص الإعداد التلقائي

# إعدادات الخادم
PORT=3000
NODE_ENV=production

# إعدادات قاعدة البيانات
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stampcoin_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# إعدادات API
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here

# إعدادات JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# إعدادات Cloudflare
CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID
CLOUDFLARE_API_KEY=$(wrangler whoami --format json | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
CLOUDFLARE_ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=ecostamp.net"      -H "Authorization: Bearer $(wrangler whoami --format json | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)"      -H "Content-Type: application/json" | jq -r '.result[0].id')

# إعدادات المراقبة
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here
EOF

echo "✅ تم إنشاء ملف . بنجاح"

# إعطاء صلاحيات للنص البرمجي
chmod +x deploy.sh

echo ""
echo "🎉 اكتمل إعداد Cloudflare بنجاح!"
echo ""
echo "الخطوات التالية:"
echo "1. قم بتحديث ملف .env بالقيم الصحيحة"
echo "2. قم بتشغيل './deploy.sh' لنشر التطبيق"
echo "3. انتقل إلى لوحة تحكم Cloudflare لإكمال الإعدادات"
echo ""
echo "📚 للمزيد من المعلومات، راجع ملف DEPLOY.md"
