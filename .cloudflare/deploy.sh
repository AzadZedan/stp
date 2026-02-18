#!/bin/bash

# نص برمجي لنشر منصة ستامبكوين على Cloudflare
# يتطلب تثبيت Wrangler CLI

# التحقق من وجود Wrangler
if ! command -v wrangler &> /dev/null; then
    echo "Wrangler CLI غير مثبت. قم بتثبيته أولاً:"
    echo "npm install -g wrangler"
    exit 1
fi

# تسجيل الدخول إلى Cloudflare (إذا لم يكن مسجلاً مسبقاً)
wrangler whoami

# تحديث معرف الحساب في wrangler.toml
read -p "أدخل معرف حساب Cloudflare الخاص بك: " ACCOUNT_ID
sed -i "s/YOUR_ACCOUNT_ID/$ACCOUNT_ID/g" wrangler.toml

# تحديث مساحة التخزين KV
read -p "أدخل معرف مساحة التخزين KV الخاصة بك (اضغط Enter لل跳过): " KV_ID
if [ ! -z "$KV_ID" ]; then
    sed -i "s/YOUR_KV_NAMESPACE_ID/$KV_ID/g" wrangler.toml
    sed -i "s/YOUR_KV_PREVIEW_ID/$KV_ID/g" wrangler.toml
fi

# تحديث معرف قاعدة البيانات
read -p "أدخل معرف قاعدة البيانات الخاصة بك (اضغط Enter لل跳过): " DB_ID
if [ ! -z "$DB_ID" ]; then
    sed -i "s/YOUR_DATABASE_ID/$DB_ID/g" wrangler.toml
fi

# نشر التطبيق
echo "جاري نشر التطبيق على Cloudflare..."
wrangler deploy

# عرض النتائج
echo ""
echo "✅ تم نشر التطبيق بنجاح!"
echo "🔗 عنوان التطبيق: https://stampcoin-platform.你的域名.workers.dev"
echo "📚 توثيق Cloudflare Workers: https://developers.cloudflare.com/workers/"
