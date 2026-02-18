# إعداد Cloudflare لمنصة ستامبكوين

هذا المجلد يحتوي على جميع الملفات اللازمة لإعداد وتكوين Cloudflare لمنصة ستامبكوين.

## الملفات

- `setup.sh`: نص برمجي لإعداد وتكوين Cloudflare تلقائياً
- `deploy.sh`: نص برمجي لنشر التطبيق على Cloudflare
- `wrangler.toml`: ملف إعدادات Cloudflare Workers
- `worker.js`: كود Cloudflare Worker

## الاستخدام

1. **تشغيل نص الإعداد**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **نشر التطبيق**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

## المتطلبات

- Wrangler CLI
- حساب Cloudflare
- Node.js 16 أو أحدث
