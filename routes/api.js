/**
 * مسارات واجهة برمجة التطبيقات (API Routes)
 */

const express = require('express');
const router = express.Router();

// استيراد الوسطاء (middleware)
const { 
  authenticateToken, 
  authorize, 
  validateLogin, 
  validateRegister 
} = require('../middleware/auth');

const { 
  apiRateLimiter, 
  loginRateLimiter, 
  transactionRateLimiter,
  sensitiveEndpointRateLimiter 
} = require('../middleware/rateLimiter');

const { validate, validateTransactionId, validateQueryParams, validateTransactionBody } = require('../middleware/validation');

const { 
  createTransaction, 
  getTransactions, 
  getTransactionById, 
  updateTransactionStatus,
  getTransactionStats 
} = require('../database/transactions');

const { generateTransactionId } = require('../utils/transactionUtils');
const { generateUniqueId } = require('../utils/helpers');

// مسار للتحقق من صحة التوكن
router.post('/auth/validate', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// مسار لتسجيل الدخول
router.post('/auth/login', loginRateLimiter, validateLogin, (req, res) => {
  // في تطبيق حقيقي، هنا سيتم التحقق من بيانات المستخدم وتوليد التوكن
  const user = {
    id: 1,
    username: req.body.username,
    role: 'admin'
  };

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    token
  });
});

// مسار لتسجيل مستخدم جديد
router.post('/auth/register', apiRateLimiter, validateRegister, (req, res) => {
  // في تطبيق حقيقي، هنا سيتم حفظ المستخدم الجديد في قاعدة البيانات
  const user = {
    id: generateUniqueId(),
    username: req.body.username,
    email: req.body.email,
    walletAddress: req.body.walletAddress
  };

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user,
    token
  });
});

// مسار لإنشاء معاملة جديدة
router.post('/transactions', 
  authenticateToken, 
  transactionRateLimiter, 
  validateTransactionBody,
  async (req, res, next) => {
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
          created_at: new Date().toISOString(),
          created_by: req.user.id
        }
      };

      // في تطبيق حقيقي، سيتم حفظ المعاملة في قاعدة البيانات هنا
      const transaction = await createTransaction(transactionData);

      // إرجاع رد بنجاح
      res.status(201).json({
        success: true,
        transaction,
        message: 'Transaction created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار للحصول على قائمة بالمعاملات
router.get('/transactions', 
  authenticateToken, 
  apiRateLimiter, 
  validateQueryParams,
  async (req, res, next) => {
    try {
      const { limit = 10, offset = 0, status, currency, sender, recipient } = req.query;

      // في تطبيق حقيقي، هنا سيتم جلب المعاملات من قاعدة البيانات
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
        },
        message: 'Transactions retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار للحصول على تفاصيل معاملة محددة
router.get('/transactions/:id', 
  authenticateToken, 
  apiRateLimiter, 
  validateTransactionId,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // في تطبيق حقيقي، هنا سيتم جلب المعاملة من قاعدة البيانات
      const transaction = await getTransactionById(id);

      res.json({
        success: true,
        transaction,
        message: 'Transaction retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار لتحديث حالة معاملة
router.put('/transactions/:id/status', 
  authenticateToken, 
  authorize(['admin']), 
  sensitiveEndpointRateLimiter, 
  validateTransactionId,
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
      const transaction = await updateTransactionStatus(id, status, {
        ...details,
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        transaction,
        message: 'Transaction status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار للحصول على إحصائيات المعاملات
router.get('/transactions/stats', 
  authenticateToken, 
  apiRateLimiter,
  async (req, res, next) => {
    try {
      const { currency } = req.query;

      // في تطبيق حقيقي، هنا سيتم جلب الإحصائيات من قاعدة البيانات
      const stats = await getTransactionStats({ currency });

      res.json({
        success: true,
        stats,
        message: 'Transaction statistics retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار للحصول على معلومات المستخدم
router.get('/user/profile', 
  authenticateToken, 
  apiRateLimiter,
  async (req, res, next) => {
    try {
      // في تطبيق حقيقي، هنا سيتم جلب معلومات المستخدم من قاعدة البيانات
      const user = {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        user,
        message: 'User profile retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// مسار للحصول على معلومات العملات المتاحة
router.get('/currencies', 
  authenticateToken, 
  apiRateLimiter,
  async (req, res, next) => {
    try {
      // في تطبيق حقيقي، هنا سيتم جلب العملات من قاعدة البيانات
      const currencies = [
        { symbol: 'STAMP', name: 'Stampcoin', decimals: 8 },
        { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
        { symbol: 'ETH', name: 'Ethereum', decimals: 18 }
      ];

      res.json({
        success: true,
        currencies,
        message: 'Currencies retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
