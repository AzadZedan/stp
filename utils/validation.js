/**
 * أدوات للتحقق من صحة البيانات في منصة Stampcoin Platform
 */

/**
 * التحقق من صحة عنوان المحفظة
 * @param {string} address - عنوان المحفظة
 * @returns {boolean} - صالح أم لا
 */
function isValidAddress(address) {
  const regex = /^0x[a-fA-F0-9]{64}$/;
  return regex.test(address);
}

/**
 * التحقق من صحة المبلغ
 * @param {number} amount - المبلغ
 * @param {number} min - الحد الأدنى (اختياري)
 * @param {number} max - الحد الأقصى (اختياري)
 * @returns {boolean} - صالح أم لا
 */
function isValidAmount(amount, min = 0.00000001, max = 1000000) {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount >= min && 
         amount <= max;
}

/**
 * التحقق من صحة معرف المعاملة
 * @param {string} txId - معرف المعاملة
 * @returns {boolean} - صالح أم لا
 */
function isValidTransactionId(txId) {
  const regex = /^tx_[0-9]+_[a-zA-Z0-9]+$/;
  return regex.test(txId);
}

/**
 * التحقق من صحة حالة المعاملة
 * @param {string} status - حالة المعاملة
 * @returns {boolean} - صالح أم لا
 */
function isValidTransactionStatus(status) {
  const validStatuses = ['created', 'pending', 'confirmed', 'failed', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * التحقق من صحة معرف الكتلة
 * @param {number} blockNumber - معرف الكتلة
 * @returns {boolean} - صالح أم لا
 */
function isValidBlockNumber(blockNumber) {
  return Number.isInteger(blockNumber) && blockNumber >= 0;
}

/**
 * التحقق من صحة عدد التأكيدات
 * @param {number} confirmations - عدد التأكيدات
 * @returns {boolean} - صالح أم لا
 */
function isValidConfirmations(confirmations) {
  return Number.isInteger(confirmations) && confirmations >= 0;
}

/**
 * التحقق من صحة معرف الكتلة
 * @param {string} hash - 해시
 * @returns {boolean} - صالح أم لا
 */
function isValidHash(hash) {
  const regex = /^[a-fA-F0-9]{64}$/;
  return regex.test(hash);
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} - صالح أم لا
 */
function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}

/**
 * التحقق من صفحة الرقم
 * @param {number} page - رقم الصفحة
 * @param {number} maxPages - الحد الأقصى للصفحات
 * @returns {boolean} - صالح أم لا
 */
function isValidPage(page, maxPages = 1000) {
  return Number.isInteger(page) && page > 0 && page <= maxPages;
}

/**
 * التحقق من صحة عدد العناصر لكل صفحة
 * @param {number} limit - عدد العناصر
 * @param {number} maxLimit - الحد الأقصى للعناصر
 * @returns {boolean} - صالح أم لا
 */
function isValidLimit(limit, maxLimit = 100) {
  return Number.isInteger(limit) && limit > 0 && limit <= maxLimit;
}

module.exports = {
  isValidAddress,
  isValidAmount,
  isValidTransactionId,
  isValidTransactionStatus,
  isValidBlockNumber,
  isValidConfirmations,
  isValidHash,
  isValidEmail,
  isValidPage,
  isValidLimit
};
