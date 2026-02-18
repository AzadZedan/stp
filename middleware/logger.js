/**
 * وسيط لتسجيل الطلبات والردود (Logging Middleware)
 */

const logger = require('../utils/logger');

/**
 * وسيط لتسجيل تفاصيل الطلبات والردود
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // تسجيل تفاصيل الطلب
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  logger.info('Incoming request', requestInfo);

  // تجاوز دالة end الخاصة بالرد لتسجيل وقت الاستجابة
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // تسجيل تفاصيل الرد
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: chunk ? chunk.length : 0
    };

    logger.info('Outgoing response', {
      requestId: req.id,
      ...responseInfo
    });

    // استدعاء الدالة الأصلية
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

module.exports = requestLogger;
