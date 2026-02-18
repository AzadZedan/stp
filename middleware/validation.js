/**
 * وسيط للتحقق من صحة الطلبات (Validation Middleware)
 */

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * وسيط للتحقق من نتائج التحقق من صحة الطلبات
 * @param {Array} validations - مصفوفة من قواعد التحقق
 * @returns {Function} - دالة الوسيط
 */
function validate(validations) {
  return async (req, res, next) => {
    // تطبيق جميع قواعد التحقق
    await Promise.all(validations.map(validation => validation.run(req)));

    // التحقق من النتائج
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // تسجيل أخطاء التحقق
    logger.warn('Validation failed', {
      errors: errors.array(),
      requestId: req.id,
      url: req.originalUrl,
      method: req.method
    });

    // إرجاع خطأ 400 Bad Request
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  };
}

/**
 * وسيط للتحقق من صحة معرّف المعاملة في معلمات المسار
 */
function validateTransactionId(req, res, next) {
  const { id } = req.params;

  // التحقق من تنسيق المعرّف
  const regex = /^tx_[0-9]+_[a-zA-Z0-9]+$/;
  if (!regex.test(id)) {
    logger.warn('Invalid transaction ID format', { id, requestId: req.id });
    return res.status(400).json({
      success: false,
      error: 'Invalid transaction ID format'
    });
  }

  next();
}

/**
 * وسيط للتحقق من صحة معاملات الاستعلام
 */
function validateQueryParams(req, res, next) {
  const { page, limit } = req.query;

  // التحقق من رقم الصفحة
  if (page && (!Number.isInteger(Number(page)) || Number(page) <= 0)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }

  // التحقق من عدد العناصر في الصفحة
  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be an integer between 1 and 100'
    });
  }

  next();
}

/**
 * وسيط للتحقق من صلة بيانات المعاملة في جسم الطلب
 */
function validateTransactionBody(req, res, next) {
  const { amount, currency, recipient, sender } = req.body;

  // التحقق من وجود الحقول المطلوبة
  if (!amount || !currency || !recipient || !sender) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: amount, currency, recipient, or sender'
    });
  }

  // التحقق من أن المبلغ هو رقم موجب
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be a positive number'
    });
  }

  // التحقق من أن العملة هي سلسلة نصية غير فارغة
  if (typeof currency !== 'string' || currency.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Currency must be a non-empty string'
    });
  }

  // التحقق من تنسيق عنوان المستلم
  const addressRegex = /^0x[a-fA-F0-9]{64}$/;
  if (!addressRegex.test(recipient)) {
    return res.status(400).json({
      success: false,
      error: 'Recipient address format is invalid'
    });
  }

  // التحقق من تنسيق عنوان المرسل
  if (!addressRegex.test(sender)) {
    return res.status(400).json({
      success: false,
      error: 'Sender address format is invalid'
    });
  }

  next();
}

module.exports = {
  validate,
  validateTransactionId,
  validateQueryParams,
  validateTransactionBody
};
