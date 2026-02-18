/**
 * ملف الخادم الرئيسي لمنصة Stampcoin Platform
 * يستخدم Express.js لإنشاء واجهة برمجة التطبيقات
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('config');

// استيراد الوسطاء (middleware)
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');
const { validate, validateTransactionId, validateQueryParams, validateTransactionBody } = require('./middleware/validation');

// استيراد أدوات قاعدة البيانات
const { initDatabase } = require('./database/init');
const { createTransaction, getTransactions, getTransactionById, updateTransactionStatus } = require('./database/transactions');

// استيراد أدوات مساعدة
const { generateTransactionId } = require('./utils/transactionUtils');
const { generateUniqueId } = require('./utils/helpers');

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;

// إضافة middlewares
app.use(cors()); // تفعيل CORS لطلبات عبر النطاقات
app.use(express.json()); // تفعيل تح JSON في الطلبات
app.use(express.urlencoded({ extended: true })); // تفعيل تحليل بيانات form-urlencoded
app.use(requestLogger); // تسجيل الطلبات

// إضافة معرف فريد لكل طلب
app.use((req, res, next) => {
  req.id = generateUniqueId();
  next();
});

// مسار لملف الحالة
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime()
  });
});

// مسار للتحقق من صحة قاعدة البيانات
app.get('/api/health', async (req, res) => {
  try {
    // في تطبيق حقيقي، هنا سيتم التحقق من الاتصال بقاعدة البيانات
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected' // سيتم التحقق من الاتصال الفعلي في التطبيق الحقيقي
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// مسارات المعاملات
// إنشاء معاملة جديدة
app.post('/api/transaction', 
  validateTransactionBody, // التحقق من صحة بيانات الطلب
  async (req, res) => {
    try {
      const { amount, currency, recipient, sender } = req.body;

      // توليد معرف فريد للمعاملة
      const transactionId = generateTransactionId();

      // إنشاء كائن المعاملة
      const transactionData = {
        id: transactionId,
        amount,
        currency,
        recipient,
        sender,
        status: 'pending',
        timestamp: new Date().toISOString(),
        details: {
          confirmations: 0,
          created_at: new Date().toISOString()
        }
      };

      // في تطبيق حقيقي، سيتم حفظ المعاملة في قاعدة البيانات هنا
      const transaction = await createTransaction(transactionData);

      // إرجاع رد بنجاح
      res.status(201).json({
        success: true,
        transaction
      });
    } catch (error) {
      next(error); // تمرير الخطأ إلى معالج الأخطاء
    }
  }
);

// الحصول على قائمة بالمعاملات
app.get('/api/transactions', 
  validateQueryParams, // التحقق من صحة معاملات الاستعلام
  async (req, res, next) => {
    try {
      const { limit = 10, offset = 0, status, currency, sender, recipient } = req.query;

      // في تطبيق حقيقي، هنا سيتم جلب المعاملات من قاعدة البيانات
      // مع تطبيق التصفية والترتيب بناءً على معاملات الاستعلام
      const transactions = await getTransactions({
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        currency,
        sender,
        recipient
      });

      res.json({
        success: true,
        transactions,
        pagination: {
          page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
          limit: parseInt(limit),
          total: transactions.length > 0 ? transactions[0].total_count : 0
        }
      });
    } catch (error) {
      next(error); // تمرير الخطأ إلى معالج الأخطاء
    }
  }
);

// الحصول على تفاصيل معاملة محددة
app.get('/api/transactions/:id', 
  validateTransactionId, // التحقق من صحة معرف المعاملة
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // في تطبيق حقيقي، هنا سيتم جلب المعاملة من قاعدة البيانات
      const transaction = await getTransactionById(id);

      res.json({
        success: true,
        transaction
      });
    } catch (error) {
      next(error); // تمرير الخطأ إلى معالج الأخطاء
    }
  }
);

// تحديث حالة معاملة
app.put('/api/transactions/:id/status',
  validateTransactionId, // التحقق من صحة معرف المعاملة
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, details } = req.body;

      // التحقق من أن الحالة صالحة
      const validStatuses = ['created', 'pending', 'confirmed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transaction status'
        });
      }

      // تحديث المعاملة
      const transaction = await updateTransactionStatus(id, status, details || {});

      res.json({
        success: true,
        transaction
      });
    } catch (error) {
      next(error); // تمرير الخطأ إلى معالج الأخطاء
    }
  }
);

// مسار للوصول إلى التوثيق
app.use(express.static(path.join(__dirname, 'docs')));

// معالجة المسارات غير الموجودة
app.use(notFoundHandler);

// معاللة الأخطاء العامة
app.use(errorHandler);

// بدء تشغيل الخادم
async function startServer() {
  try {
    // تهيئة قاعدة البيانات
    await initDatabase();

    // بدء تشغيل الخادم
    app.listen(PORT, () => {
      console.log(`Stampcoin Platform server is running on port ${PORT}`);
      console.log(`API documentation available at: http://localhost:${PORT}/api/status`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// تشغيل الخادم
startServer();

// معاللة إيقاف التشغيل بشكل نظيف
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');

  // في تطبيق حقيقي، هنا سيتم إغلاق الاتصالات بقاعدة البيانات
  console.log('Closing server...');

  // إغلاق الخادم
  process.exit(0);
});

