const express = require("express");
const fs = require("fs");
const path = require("path");

function buildDashboardHtml() {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>منصة ستامكوين</title>
  <style>
    body { font-family: Tahoma, Arial, sans-serif; background: #f4f7fb; margin: 0; }
    header { background: #0a3b6e; color: #fff; padding: 16px 20px; }
    main { max-width: 1000px; margin: 20px auto; padding: 0 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .card { background: #fff; border-radius: 10px; padding: 14px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    h2 { margin-top: 0; font-size: 18px; }
    .muted { color: #666; font-size: 13px; }
    .pair { display: flex; justify-content: space-between; margin: 8px 0; }
    .up { color: #0f8a2c; }
    .down { color: #b3261e; }
    button { background: #0a3b6e; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    button:disabled { opacity: .5; cursor: not-allowed; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <header>
    <h1>منصة ستامكوين</h1>
    <div class="muted">لوحة تشغيل تجريبية</div>
  </header>

  <main>
    <div class="grid">
      <section class="card">
        <h2>الرصيد</h2>
        <div id="balance">جاري التحميل...</div>
      </section>

      <section class="card">
        <h2>أزواج التداول</h2>
        <div id="pairs">جاري التحميل...</div>
      </section>

      <section class="card">
        <h2>طرق التحويل</h2>
        <ul id="methods"></ul>
      </section>

      <section class="card">
        <h2>الإشعارات</h2>
        <ul id="notifications"></ul>
      </section>
    </div>
  </main>

  <script>
    async function loadJson(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }

    async function loadBalance() {
      const balance = await loadJson('/api/balance');
      const el = document.getElementById('balance');
      el.innerHTML = '<div>STP: ' + balance.stp + '</div>' +
                     '<div>EUR: ' + balance.eur + '</div>' +
                     '<div>USD: ' + balance.usd + '</div>';
    }

    async function loadPairs() {
      const pairs = await loadJson('/api/trading-pairs');
      const el = document.getElementById('pairs');
      el.innerHTML = '';
      pairs.forEach(function (pair) {
        const cls = pair.change >= 0 ? 'up' : 'down';
        const row = document.createElement('div');
        row.className = 'pair';
        row.innerHTML = '<span>' + pair.symbol + '</span>' +
                        '<span>' + pair.price + ' <strong class="' + cls + '">' + pair.change + '</strong></span>';
        el.appendChild(row);
      });
    }

    async function loadMethods() {
      const methods = await loadJson('/api/transfer-methods');
      const el = document.getElementById('methods');
      el.innerHTML = '';
      methods.forEach(function (m) {
        const li = document.createElement('li');
        li.innerHTML = m.name + ' <button onclick="alert(\'اختيار: ' + m.id + '\')">اختيار</button>';
        el.appendChild(li);
      });
    }

    async function markAsRead(id) {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      if (res.ok) loadNotifications();
    }

    async function loadNotifications() {
      const notifications = await loadJson('/api/notifications');
      const el = document.getElementById('notifications');
      el.innerHTML = '';
      notifications.forEach(function (n) {
        const li = document.createElement('li');
        const btn = n.read ? '' : ' <button onclick="markAsRead(' + n.id + ')">قراءة</button>';
        li.innerHTML = '<strong>' + n.title + '</strong><div class="muted">' + n.message + ' - ' + n.date + '</div>' + btn;
        el.appendChild(li);
      });
    }

    async function init() {
      try {
        await Promise.all([loadBalance(), loadPairs(), loadMethods(), loadNotifications()]);
      } catch (e) {
        console.error('Dashboard initialization failed:', e);
      }
    }

    init();
  </script>
</body>
</html>`;
}

async function setupUI(options = {}) {
  const app = express();
  const port = Number(process.env.PORT || options.port || 3000);

  app.use(express.json());

  app.get("/api/balance", async (_req, res) => {
    res.json({ stp: 1000, eur: 500, usd: 550 });
  });

  app.get("/api/transfer-methods", async (_req, res) => {
    res.json([
      { id: "bank", name: "تحويل بنكي" },
      { id: "crypto", name: "تحويل رقمي" },
      { id: "stp", name: "تحويل بعملة STP" }
    ]);
  });

  app.get("/api/trading-pairs", async (_req, res) => {
    res.json([
      { symbol: "STP/EUR", price: 0.15, change: 0.02 },
      { symbol: "STP/USD", price: 0.16, change: 0.03 },
      { symbol: "STP/BTC", price: 0.0000035, change: -0.0005 }
    ]);
  });

  app.get("/api/notifications", async (_req, res) => {
    res.json([
      { id: 1, title: "تم تأكيد عملية الشراء", message: "تم شراء طابع بنجاح", date: "2026-02-23", read: false },
      { id: 2, title: "عرض جديد", message: "تمت إضافة طابع نادر جديد", date: "2026-02-22", read: false },
      { id: 3, title: "تحديث السعر", message: "قيمة طابعك ارتفعت", date: "2026-02-21", read: true }
    ]);
  });

  app.post("/api/notifications/read", async (_req, res) => {
    res.json({ success: true });
  });

  const publicDir = path.join(__dirname, "..", "public");
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, "index.html"), buildDashboardHtml(), "utf8");

  app.use(express.static(publicDir));

  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`UI server listening on http://localhost:${port}`);
      resolve({ success: true, message: "UI setup complete", port });
    });
  });
}

if (require.main === module) {
  setupUI().catch((error) => {
    console.error("Failed to setup UI:", error);
    process.exit(1);
  });
}

module.exports = { setupUI };
