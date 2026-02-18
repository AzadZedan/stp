/**
 * أدوات مساعدة عامة لمنصة Stampcoin Platform
 */

/**
 * إنشاء معرف فريد عشوائي
 * @param {number} length - طول المعرف
 * @returns {string} - معرف فريد
 */
function generateUniqueId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * تنسيق التاريخ إلى سلسلة ISO
 * @param {Date} date - التاريخ
 * @returns {string} - سلسلة ISO
 */
function toISOString(date = new Date()) {
  return date.toISOString();
}

/**
 * تحويل الكائن إلى سلسلة استعلام URL
 * @param {Object} params - معلمات الاستعلام
 * @returns {string} - سلسلة الاستعلام
 */
function objectToQueryString(params) {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * تحليل سلسلة استعلام URL إلى كائن
 * @param {string} queryString - سلسلة الاستعلام
 * @returns {Object} - معلمات الاستعلام
 */
function queryStringToObject(queryString) {
  const params = {};
  const pairs = queryString.replace(/^\?/, '').split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
    }
  }

  return params;
}

/**
 * نسخة عميقة لكائن
 * @param {any} obj - الكائن الذي سيتم نسخه
 * @returns {any} - نسخة من الكائن
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * تأميد سلسلة نصية
 * @param {string} text - النص الأصلي
 * @returns {string} - النص المؤمّن
 */
function sanitizeText(text) {
  if (typeof text !== 'string') return '';

  // إزالة أي HTML أو JavaScript
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * تنسيق المبلغ مع الرمز
 * @param {number} amount - المبلغ
 * @param {string} currency - العملة
 * @param {string} locale - اللocale (اختياري)
 * @returns {string} - المبلغ المنسق
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * تأخير تنفيذ الوظيفة
 * @param {number} ms - عدد المللي ثواني للتأخير
 * @returns {Promise} - وعد بالتنفيذ بعد التأخير
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * التحقق مما إذا كان الكائن فارغاً
 * @param {Object} obj - الكائن الذي سيتم التحقق منه
 * @returns {boolean} - فارغ أم لا
 */
function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
}

/**
* دالة للتجاوز الآمن للوصول إلى خصائص الكائن المتداخلة
* @param {Object} obj - الكائن الذي سيتم الوصول إليه
* @param {string} path - المسار إلى الخاصية (مثل: 'user.profile.name')
* @param {any} defaultValue - القيمة الافتراضية إذا لم يتم العثور على الخاصية
* @returns {any} - قيمة الخاصية أو القيمة الافتراضية
*/
function getNestedValue(obj, path, defaultValue = undefined) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}

module.exports = {
  generateUniqueId,
  toISOString,
  objectToQueryString,
  queryStringToObject,
  deepClone,
  sanitizeText,
  formatCurrency,
  delay,
  isEmpty,
  getNestedValue
};
