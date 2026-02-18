/**
 * وسيط لأمان التطبيق (Security Middleware)
 */

const helmet = require('helmet');
const compression = require('compression');
const config = require('config');
const logger = require('../utils/logger');

/**
 * تطبيق إعدادات Helmet لأمان التطبيق
 */
function applyHelmetSecurity() {
  // إعداد Helmet
  const helmetOptions = {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stampcoin.com"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  };

  return helmet(helmetOptions);
}

/**
 * تطبيق ضغط الردود
 */
function applyCompression() {
  return compression({
    level: 6, // مستوى الضغط (1-9)
    threshold: 1024, // حجم الرد بالبايت الذي يجب أن يكون أكبر من هذا الحد ليتم ضغطه
    filter: (req, res) => {
      // تطبيق الضغط فقط لطلبات النص
      if (req.headers['x-no-compression']) {
        return false;
      }

      // تطبيق الضغط فقط لردود النص
      return /json|text|javascript|css|html|svg/.test(res.getHeader('Content-Type'));
    }
  });
}

/**
 * إضافة رؤوس أمان مخصصة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function addSecurityHeaders(req, res, next) {
  // إضافة رأس X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // إضافة رأس X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');

  // إضافة رأس X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // إضافة رأس Permissions-Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // إضافة رأس Server
  res.setHeader('Server', 'Stampcoin-Platform/2.0.0');

  next();
}

/**
 * التحقق من مصدر الطلب (CORS)
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function checkCorsOrigin(req, res, next) {
  const allowedOrigins = config.cors.origin;
  const origin = req.headers.origin;

  // إذا كان المصدر مسموحاً به، أضف رأس Access-Control-Allow-Origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // إضافة رؤوس CORS الأخرى
  res.setHeader('Access-Control-Allow-Methods', config.cors.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 ساعة

  // التعامل مع طلبات OPTIONS (طلبات مسبقة لل CORS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

/**
 * التحقق من صحة التوكن في رأس الطلب
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function validateTokenHeader(req, res, next) {
  // الحصول على التوكن من رأس الطلب
  const token = req.headers['x-api-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'API token is required'
    });
  }

  // في تطبيق حقيقي، هنا سيتم التحقق من صحة التوكن
  // مثال:
  // try {
  //   const decoded = jwt.verify(token, config.api.jwt.secret);
  //   req.user = decoded;
  // } catch (err) {
  //   return res.status(401).json({
  //     success: false,
  //     error: 'Invalid API token'
  //   });
  // }

  next();
}

/**
 * التحقق من صحة بيانات JSON في الطلب
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function validateJsonPayload(req, res, next) {
  // التحقق من أن محتوى الطلب هو JSON
  const contentType = req.get('Content-Type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        JSON.parse(data);
        next();
      } catch (err) {
        logger.warn('Invalid JSON payload', {
          error: err.message,
          requestId: req.id
        });

        res.status(400).json({
          success: false,
          error: 'Invalid JSON payload'
        });
      }
    });
  } else {
    next();
  }
}

/**
 * تسجيل محاولات الوصول إلى نقاط النهاية الحساسة
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function logSensitiveAccess(req, res, next) {
  const sensitiveEndpoints = ['/api/admin', '/api/users', '/api/transactions'];
  const isSensitiveEndpoint = sensitiveEndpoints.some(path => req.path.startsWith(path));

  if (isSensitiveEndpoint) {
    logger.info('Access to sensitive endpoint', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

module.exports = {
  applyHelmetSecurity,
  applyCompression,
  addSecurityHeaders,
  checkCorsOrigin,
  validateTokenHeader,
  validateJsonPayload,
  logSensitiveAccess
};
