/**
 * وسيط لتحديد معدل الطلبات (Rate Limiting Middleware)
 */

const rateLimit = require('express-rate-limit');
const config = require('config');
const logger = require('../utils/logger');

/**
 * معدل الطلبات العام للواجهة البرمجية
 */
const apiRateLimiter = rateLimit({
  windowMs: config.api.rateLimit.windowMs, // نافذة الزمن (15 دقيقة)
  max: config.api.rateLimit.max, // الحد الأقصى للطلبات في النافذة
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // إرجاع معلومات عن معدل الطلبات في الرؤوس القياسية
  legacyHeaders: false, // إخفاء الرؤوس القديمة
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
      endpoint: req.originalUrl,
      limit: options.max,
      windowMs: options.windowMs
    });

    res.status(options.statusCode).json(options.message);
  }
});

/**
 * معدل الطلبات الخاص بتسجيل الدخول
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات تسجيل دخول كحد أقصى
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });

    res.status(options.statusCode).json(options.message);
  }
});

/**
 * معدل الطلبات الخاص بإنشاء المعاملات
 */
const transactionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // دقيقة واحدة
  max: 10, // 10 معاملات كحد أقصى في الدقيقة
  message: {
    success: false,
    error: 'Too many transaction attempts, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Transaction rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });

    res.status(options.statusCode).json(options.message);
  }
});

/**
 * معدل الطلبات الخاص بالوصول إلى نقاط النهاية الحساسة
 */
const sensitiveEndpointRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب كحد أقصى
  message: {
    success: false,
    error: 'Too many requests to sensitive endpoint, please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Sensitive endpoint rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
      endpoint: req.originalUrl
    });

    res.status(options.statusCode).json(options.message);
  }
});

/**
 * معدل الطلبات بناءً على عنوان IP
 * @param {number} maxRequests - الحد الأقصى للطلبات
 * @param {number} windowMs - نافذة الزمن بالملي ثانية
 * @returns {Function} - دالة الوسيط
 */
function createIpBasedRateLimiter(maxRequests, windowMs) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // استخدام عنوان IP كمفتاح
      return req.ip;
    },
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    },
    handler: (req, res, next, options) => {
      logger.warn('IP-based rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id,
        limit: options.max,
        windowMs: options.windowMs
      });

      res.status(options.statusCode).json(options.message);
    }
  });
}

/**
 * معدل الطلبات بناءً على معرّف المستخدم
 * @param {number} maxRequests - الحد الأقصى للطلبات
 * @param {number} windowMs - نافذة الزمن بالملي ثانية
 * @returns {Function} - دالة الوسيط
 */
function createUserBasedRateLimiter(maxRequests, windowMs) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => {
      // استخدام معرّف المستخدم كمفتاح إذا كان موجوداً، وإلا استخدام عنوان IP
      return req.user ? `user_${req.user.id}` : req.ip;
    },
    message: {
      success: false,
      error: 'Too many requests, please try again later.'
    },
    handler: (req, res, next, options) => {
      const userId = req.user ? req.user.id : 'anonymous';

      logger.warn('User-based rate limit exceeded', {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id,
        limit: options.max,
        windowMs: options.windowMs
      });

      res.status(options.statusCode).json(options.message);
    }
  });
}

module.exports = {
  apiRateLimiter,
  loginRateLimiter,
  transactionRateLimiter,
  sensitiveEndpointRateLimiter,
  createIpBasedRateLimiter,
  createUserBasedRateLimiter
};
