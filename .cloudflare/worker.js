// Cloudflare Worker لمنصة ستامبكوين

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * معالجة الطلبات
 */
async function handleRequest(request) {
  const url = new URL(request.url)

  // إضافة رؤوس الأمان
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.ecostamp.net; connect-src 'self' https://api.ecostamp.net; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
  }

  // معالجة الطلبات المختلفة
  if (url.pathname === '/api/transaction') {
    // معالجة معاملات العملات
    return handleTransaction(request, securityHeaders)
  } else if (url.pathname.startsWith('/api/')) {
    // معالجة باقي واجهات برمجة التطبيقات
    return handleApiRequest(request, securityHeaders)
  } else if (url.pathname === '/health') {
    // نقطة فحص الصحة
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }

  // معالجة الطلبات العادية (ملفات ثابتة)
  return handleStaticRequest(request, securityHeaders)
}

/**
 * معالجة معاملات العملات
 */
async function handleTransaction(request, securityHeaders) {
  try {
    // التحقق من صحة الطلب
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: securityHeaders 
      })
    }

    // جلب البيانات من الطلب
    const data = await request.json()

    // التحقق من البيانات المطلوبة
    if (!data.amount || !data.currency || !data.recipient) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // معالجة المعاملة (هنا يمكنك إضافة منطقك الخاص)
    const transaction = {
      id: generateTransactionId(),
      amount: data.amount,
      currency: data.currency,
      recipient: data.recipient,
      sender: data.sender || 'system',
      timestamp: new Date().toISOString(),
      status: 'pending'
    }

    // تخزين المعاملة في KV
    await STAMPCOIN_KV.put(`transaction:${transaction.id}`, JSON.stringify(transaction))

    // إرسال الرد
    return new Response(JSON.stringify({ success: true, transaction }), {
      status: 200,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Transaction error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * معالجة باقي واجهات برمجة التطبيقات
 */
async function handleApiRequest(request, securityHeaders) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api/', '')

  try {
    // التحقق من المصادقة
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // التحقق من التوكن
    const token = authHeader.substring(7)
    const isValidToken = await validateToken(token)

    if (!isValidToken) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // معالجة الطلب حسب المسار
    switch (path) {
      case 'balance':
        return handleBalanceRequest(request, securityHeaders)
      case 'transactions':
        return handleTransactionsRequest(request, securityHeaders)
      case 'wallet':
        return handleWalletRequest(request, securityHeaders)
      default:
        return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * معالجة طلبات الرصيد
 */
async function handleBalanceRequest(request, securityHeaders) {
  try {
    const url = new URL(request.url)
    const address = url.searchParams.get('address')

    if (!address) {
      return new Response(JSON.stringify({ error: 'Address required' }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // جلب الرصيد من التخزين
    const balance = await STAMPCOIN_KV.get(`balance:${address}`)

    if (!balance) {
      return new Response(JSON.stringify({ 
        address, 
        balance: 0,
        currency: 'STAMP'
      }), {
        status: 200,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      address,
      balance: JSON.parse(balance),
      currency: 'STAMP'
    }), {
      status: 200,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Balance request error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * معالجة طلبات المعاملات
 */
async function handleTransactionsRequest(request, securityHeaders) {
  try {
    const url = new URL(request.url)
    const address = url.searchParams.get('address')
    const limit = parseInt(url.searchParams.get('limit')) || 10
    const offset = parseInt(url.searchParams.get('offset')) || 0

    if (!address) {
      return new Response(JSON.stringify({ error: 'Address required' }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // جلب المعاملات المتعلقة بالعنوان
    const transactions = []
    const list = await STAMPCOIN_KV.list({ prefix: `transaction:${address}:` })

    for (let i = 0; i < list.keys.length; i++) {
      if (i >= offset && i < offset + limit) {
        const key = list.keys[i]
        const value = await STAMPCOIN_KV.get(key.name)
        if (value) {
          transactions.push(JSON.parse(value))
        }
      }
    }

    return new Response(JSON.stringify({
      address,
      transactions,
      total: list.keys.length,
      limit,
      offset
    }), {
      status: 200,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Transactions request error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * معالجة طلبات المحفظة
 */
async function handleWalletRequest(request, securityHeaders) {
  try {
    const url = new URL(request.url)
    const address = url.searchParams.get('address')

    if (!address) {
      return new Response(JSON.stringify({ error: 'Address required' }), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    // جلب معلومات المحفظة
    const walletInfo = await STAMPCOIN_KV.get(`wallet:${address}`)

    if (!walletInfo) {
      // إنشاء محفظة جديدة إذا لم تكن موجودة
      const newWallet = {
        address,
        balance: 0,
        transactions: [],
        created: new Date().toISOString()
      }

      await STAMPCOIN_KV.put(`wallet:${address}`, JSON.stringify(newWallet))

      return new Response(JSON.stringify(newWallet), {
        status: 200,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(JSON.parse(walletInfo)), {
      status: 200,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Wallet request error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * معالجة الطلبات الثابتة (ملفات HTML, CSS, JS)
 */
async function handleStaticRequest(request, securityHeaders) {
  const url = new URL(request.url)

  // إضافة إعدادات التخزين المؤقت
  const cacheHeaders = {
    'Cache-Control': 'public, max-age=31536000, immutable',
    ...securityHeaders
  }

  // محاكاة خدمة الملفات الثابتة
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>منصة ستامبكوين</title>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <header>
          <h1>منصة ستامبكوين</h1>
          <nav>
            <a href="/">الرئيسية</a>
            <a href="/wallet">المحفظة</a>
            <a href="/transactions">المعاملات</a>
            <a href="/about">حول المنصة</a>
          </nav>
        </header>

        <main>
          <section class="hero">
            <h2>مرحباً بك في منصة ستامبكوين</h2>
            <p>منصة آمنة وسريعة للمعاملات الرقمية</p>
            <button id="connect-wallet">اتصل بالمحفظة</button>
          </section>

          <section class="features">
            <h2>المميزات</h2>
            <div class="feature-grid">
              <div class="feature">
                <h3>أمان عالي</h3>
                <p>تشفير متقدم لحماية معاملاتك</p>
              </div>
              <div class="feature">
                <h3>سرعة فائقة</h3>
                <p>معاملات فورية في ثوانٍ</p>
              </div>
              <div class="feature">
                <h3>مجتمع نشط</h3>
                <p>انضم لمجتمعنا العالمي</p>
              </div>
            </div>
          </section>

          <section class="wallet-info">
            <h2>معلومات المحفظة</h2>
            <div id="wallet-details">
              <p>اتصل بمحفظتك لعرض المعلومات</p>
            </div>
          </section>
        </main>

        <footer>
          <p>© 2023 منصة ستامبكوين. جميع الحقوق محفوظة.</p>
        </footer>

        <script src="/app.js"></script>
      </body>
      </html>
    `, {
      headers: { ...cacheHeaders, 'Content-Type': 'text/html' }
    })
  }

  // ملف CSS
  if (url.pathname === '/styles.css') {
    return new Response(`
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        color: #333;
        background-color: #f8f9fa;
      }

      header {
        background-color: #2c3e50;
        color: white;
        padding: 1rem;
        text-align: center;
      }

      nav {
        margin-top: 1rem;
      }

      nav a {
        color: white;
        text-decoration: none;
        margin: 0 15px;
        font-weight: bold;
      }

      nav a:hover {
        text-decoration: underline;
      }

      main {
        max-width: 1200px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      .hero {
        text-align: center;
        padding: 3rem 0;
        background-color: #3498db;
        color: white;
        border-radius: 8px;
        margin-bottom: 2rem;
      }

      .hero h2 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      .hero p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
      }

      button {
        background-color: #e74c3c;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      button:hover {
        background-color: #c0392b;
      }

      .features {
        margin-bottom: 2rem;
      }

      .features h2 {
        text-align: center;
        margin-bottom: 2rem;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }

      .feature {
        background-color: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      .feature h3 {
        margin-top: 0;
        color: #2c3e50;
      }

      .wallet-info {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      footer {
        text-align: center;
        padding: 1.5rem;
        background-color: #2c3e50;
        color: white;
        margin-top: 2rem;
      }

      @media (max-width: 768px) {
        nav a {
          display: block;
          margin: 5px 0;
        }

        .hero h2 {
          font-size: 2rem;
        }
      }
    `, {
      headers: { ...cacheHeaders, 'Content-Type': 'text/css' }
    })
  }

  // ملف JavaScript
  if (url.pathname === '/app.js') {
    return new Response(`
      // متغيرات عامة
      let walletAddress = null;
      let isConnected = false;

      // انتظر تحميل الصفحة
      document.addEventListener('DOMContentLoaded', () => {
        // ربط زر الاتصال بالمحفظة
        const connectButton = document.getElementById('connect-wallet');
        if (connectButton) {
          connectButton.addEventListener('click', connectWallet);
        }

        // التحقق من وجود محفظة محلية
        checkLocalWallet();
      });

      // الاتصال بالمحفظة
      async function connectWallet() {
        try {
          // في تطبيق حقيقي، سيتصل بمحفظة مثل MetaMask
          // هنا نحاكي الاتصال
          walletAddress = 'stampcoin_' + Math.random().toString(36).substr(2, 9);
          isConnected = true;

          // حفظ المحفظة في التخزين المحلي
          localStorage.setItem('stampcoin_wallet', walletAddress);

          // تحديث الواجهة
          updateWalletUI();

          // عرض رسالة نجاح
          showNotification('تم الاتصال بالمحفظة بنجاح!', 'success');
        } catch (error) {
          console.error('Error connecting wallet:', error);
          showNotification('فشل الاتصال بالمحفظة', 'error');
        }
      }

      // التحقق من وجود محفظة محلية
      function checkLocalWallet() {
        const localWallet = localStorage.getItem('stampcoin_wallet');
        if (localWallet) {
          walletAddress = localWallet;
          isConnected = true;
          updateWalletUI();
        }
      }

      // تحديث واجهة المستخدم للمحفظة
      async function updateWalletUI() {
        const walletDetails = document.getElementById('wallet-details');
        if (!walletDetails) return;

        if (isConnected && walletAddress) {
          try {
            // جلب معلومات المحفظة من API
            const response = await fetch(\`/api/wallet?address=\${walletAddress}\`);
            const walletInfo = await response.json();

            walletDetails.innerHTML = \`
              <div class="wallet-card">
                <h3>عنوان المحفظة</h3>
                <p class="address">\${walletAddress}</p>

                <h3>الرصيد</h3>
                <p class="balance">\${walletInfo.balance} STAMP</p>

                <h3>آخر معاملة</h3>
                <p>\${walletInfo.transactions.length > 0 ? 
                  new Date(walletInfo.transactions[0].timestamp).toLocaleDateString() : 
                  'لا توجد معاملات'}</p>

                <button id="send-transaction">إرسال عملة</button>
                <button id="view-transactions">عرض المعاملات</button>
              </div>
            \`;

            // ربط الأزرار الجديدة
            document.getElementById('send-transaction').addEventListener('click', showSendForm);
            document.getElementById('view-transactions').addEventListener('click', viewTransactions);

          } catch (error) {
            console.error('Error fetching wallet info:', error);
            walletDetails.innerHTML = '<p>فشل تحميل معلومات المحفظة</p>';
          }
        } else {
          walletDetails.innerHTML = '<p>اتصل بمحفظتك لعرض المعلومات</p>';
        }
      }

      // عرض نموذج إرسال العملة
      function showSendForm() {
        const walletDetails = document.getElementById('wallet-details');
        walletDetails.innerHTML = \`
          <div class="transaction-form">
            <h3>إرسال عملات</h3>
            <form id="send-form">
              <div class="form-group">
                <label for="recipient">عنوان المستلم:</label>
                <input type="text" id="recipient" required>
              </div>

              <div class="form-group">
                <label for="amount">الكمية:</label>
                <input type="number" id="amount" min="0.01" step="0.01" required>
              </div>

              <div class="form-group">
                <label for="note">ملاحظات (اختياري):</label>
                <input type="text" id="note">
              </div>

              <button type="submit">إرسال</button>
              <button type="button" id="cancel">إلغاء</button>
            </form>
          </div>
        \`;

        // ربط النموذج
        document.getElementById('send-form').addEventListener('submit', sendTransaction);
        document.getElementById('cancel').addEventListener('click', () => updateWalletUI());
      }

      // إرسال معاملة
      async function sendTransaction(event) {
        event.preventDefault();

        const recipient = document.getElementById('recipient').value;
        const amount = parseFloat(document.getElementById('amount').value);

        try {
          // إرسال المعاملة إلى API
          const response = await fetch('/api/transaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': \`Bearer \${localStorage.getItem('stampcoin_token') || 'demo-token'}\`
            },
            body: JSON.stringify({
              amount,
              currency: 'STAMP',
              recipient,
              sender: walletAddress
            })
          });

          const result = await response.json();

          if (result.success) {
            showNotification('تم إرسال المعاملة بنجاح!', 'success');
            updateWalletUI(); // تحديث معلومات المحفظة
          } else {
            showNotification(\`فشل إرسال المعاملة: \${result.error}\`, 'error');
          }

        } catch (error) {
          console.error('Error sending transaction:', error);
          showNotification('فشل إرسال المعاملة', 'error');
        }
      }

      // عرض المعاملات
      async function viewTransactions() {
        const walletDetails = document.getElementById('wallet-details');

        try {
          // جلب المعاملات من API
          const response = await fetch(\`/api/transactions?address=\${walletAddress}\`);
          const transactionsData = await response.json();

          let transactionsHTML = '<h3>معاملاتك</h3>';

          if (transactionsData.transactions.length > 0) {
            transactionsHTML += '<div class="transactions-list">';

            for (const tx of transactionsData.transactions) {
              const date = new Date(tx.timestamp).toLocaleDateString();
              transactionsHTML += \`
                <div class="transaction-item">
                  <div class="transaction-info">
                    <p><strong>المعاملة:</strong> \${tx.id}</p>
                    <p><strong>التاريخ:</strong> \${date}</p>
                    <p><strong>الحالة:</strong> \${tx.status}</p>
                  </div>
                  <div class="transaction-amount">
                    <p>\${tx.amount} STAMP</p>
                  </div>
                </div>
              \`;
            }

            transactionsHTML += '</div>';
          } else {
            transactionsHTML = '<p>لا توجد معاملات</p>';
          }

          walletDetails.innerHTML = \`
            <div class="transactions-view">
              \${transactionsHTML}
              <button id="back-to-wallet">رجوع للمحفظة</button>
            </div>
          \`;

          // ربط زر الرجوع
          document.getElementById('back-to-wallet').addEventListener('click', () => updateWalletUI());

        } catch (error) {
          console.error('Error fetching transactions:', error);
          walletDetails.innerHTML = '<p>فشل تحميل المعاملات</p>';
        }
      }

      // عرض إشعار
      function showNotification(message, type) {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = \`notification \${type}\`;
        notification.textContent = message;

        // إضافة الإشعار إلى الصفحة
        document.body.appendChild(notification);

        // إزالة الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
          notification.remove();
        }, 3000);
      }
    `, {
      headers: { ...cacheHeaders, 'Content-Type': 'application/javascript' }
    })
  }

  // إذا لم يتم العثور على الملف المطلوب
  return new Response('File not found', {
    status: 404,
    headers: securityHeaders
  })
}

/**
 * التحقق من صلاحية التوكن
 */
async function validateToken(token) {
  // في تطبيق حقيقي، سيتم التحقق من التوكن في قاعدة البيانات
  // هنا نحاكي التحقق
  return token === 'demo-token' || token.startsWith('stampcoin_')
}

/**
 * إنشاء معرف فريد للمعاملات
 */
function generateTransactionId() {
  return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}
