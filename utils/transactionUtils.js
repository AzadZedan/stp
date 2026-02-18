/**
 * أدوات مساعدة للتعامل مع المعاملات في منصة Stampcoin Platform
 */

/**
 * إنشاء معرف فريد للمعاملة
 * @returns {string} معرف فريد للمعاملة
 */
function generateTransactionId() {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * التحقق من صحة بيانات المعاملة
 * @param {Object} transaction - بيانات المعاملة
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
function validateTransaction(transaction) {
  const errors = [];

  if (!transaction || typeof transaction !== 'object') {
    errors.push('Transaction must be an object');
    return { isValid: false, errors };
  }

  if (!transaction.amount || typeof transaction.amount !== 'number' || transaction.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!transaction.currency || typeof transaction.currency !== 'string' || transaction.currency.trim() === '') {
    errors.push('Currency must be a non-empty string');
  }

  if (!transaction.recipient || typeof transaction.recipient !== 'string' || transaction.recipient.trim() === '') {
    errors.push('Recipient must be a non-empty string');
  }

  if (!transaction.sender || typeof transaction.sender !== 'string' || transaction.sender.trim() === '') {
    errors.push('Sender must be a non-empty string');
  }

  // التحقق من تنسيق العناوين (مثال: يجب أن يبدأ بـ 0x ويحتوي على 64 حرف)
  const addressRegex = /^0x[a-fA-F0-9]{64}$/;
  if (!addressRegex.test(transaction.recipient)) {
    errors.push('Recipient address format is invalid');
  }

  if (!addressRegex.test(transaction.sender)) {
    errors.push('Sender address format is invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * حساب رسوم المعاملة بناءً على المبلغ
 * @param {number} amount - المبلغ
 * @returns {number} - الرسوم
 */
function calculateTransactionFee(amount) {
  // رسوم ثابتة بنسبة 0.1% مع حد أدنى وحد أقصى
  const feePercentage = 0.001; // 0.1%
  const minFee = 0.01;
  const maxFee = 100;

  let fee = amount * feePercentage;

  if (fee < minFee) fee = minFee;
  if (fee > maxFee) fee = maxFee;

  return parseFloat(fee.toFixed(8)); // تحديد 8 منازل عشرية
}

/**
 * تنسيق تاريخ ISO إلى تنسيق قابل للقراءة
 * @param {string} isoString - سلسلة التاريخ ISO
 * @returns {string} - التاريخ المنسق
 */
function formatTransactionDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * حساب حالة المعاملة بناءً على المعطيات
 * @param {Object} transaction - معاملة
 * @returns {string} - الحالة المحسوبة
 */
function calculateTransactionStatus(transaction) {
  if (!transaction) return 'unknown';

  // في تطبيق حقيقي، سيتم تحديد الحالة بناءً على منطق أكثر تعقيداً
  if (transaction.confirmations >= 12) {
    return 'confirmed';
  } else if (transaction.confirmations > 0) {
    return 'pending';
  } else if (transaction.status) {
    return transaction.status;
  }

  return 'created';
}

/**
 * تحويل العملة إلى USD (مثال)
 * @param {number} amount - المبلغ
 * @param {string} currency - العملة
 * @returns {number} - المبلغ المحول
 */
function convertToUSD(amount, currency) {
  // في تطبيق حقيقي، سيتم الحصول على سعر الصرف من API خارجي
  const exchangeRates = {
    'STAMP': 0.5,
    'BTC': 50000,
    'ETH': 3000
  };

  if (currency === 'USD') return amount;

  const rate = exchangeRates[currency] || 0;
  return amount * rate;
}

module.exports = {
  generateTransactionId,
  validateTransaction,
  calculateTransactionFee,
  formatTransactionDate,
  calculateTransactionStatus,
  convertToUSD
};
