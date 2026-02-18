/**
 * وسيط للتعامل مع الأخطاء (Error Handling Middleware)
 */

const logger = require('../utils/logger');

/**
 * وسيط للتعامل مع الأخطاء غير المعالجة
 * @param {Error} err - الكائن الخطأ
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function errorHandler(err, req, res, next) {
  // تسجيل الخطأ
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    url: req.originalUrl,
    method: req.method
  });

  // تحديد حالة الرد بناءً على نوع الخطأ
  let statusCode = 500;
  let errorMessage = 'Internal server error';

  // أخطاء معروفة
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    errorMessage = 'Conflict';
  }

  // في بيئة التطوير، تضمين تفاصيل الخطأ
  const errorResponse = {
    success: false,
    error: errorMessage,
    requestId: req.id
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      message: err.message,
      stack: err.stack
    };
  }

  // إرسال رد الخطأ
  res.status(statusCode).json(errorResponse);
}

/**
 * وسيط للتعامل مع 404 (غير موجود)
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.name = 'NotFoundError';
  next(error);
}

/**
 * وسيط لمعاللة أخطاء المزامنة
 * @param {Error} err - الكائن الخطأ
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function syncErrorHandler(err, req, res, next) {
  // إذا كان الخطأ هو خطأ في المزامنة (غير معروف)
  if (!err.name || err.name !== 'NotFoundError') {
    logger.error('Synchronous error', {
      error: err.message,
      stack: err.stack,
      requestId: req.id,
      url: req.originalUrl,
      method: req.method
    });

    const errorResponse = {
      success: false,
      error: 'Internal server error',
      requestId: req.id
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = {
        message: err.message,
        stack: err.stack
      };
    }

    res.status(500).json(errorResponse);
  } else {
    next(err);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  syncErrorHandler
};
