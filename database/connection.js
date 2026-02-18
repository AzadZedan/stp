/**
 * إدارة اتصال قاعدة البيانات
 */

const { Pool } = require('pg');
const config = require('config');
const logger = require('../utils/logger');

// إنشاء مجموعة الاتصال
const pool = new Pool({
  host: config.get('database.host'),
  port: config.get('database.port'),
  database: config.get('database.name'),
  user: config.get('database.user'),
  password: config.get('database.password'),
  max: 20, // الحد الأقصى لعدد الاتصالات
  idleTimeoutMillis: 30000, // وقت الخمول قبل إغلاق الاتصال
  connectionTimeoutMillis: 2000, // وقت انتظار الاتصال
});

// اختبار الاتصال عند بدء التشغيل
pool.connect()
  .then(client => {
    logger.info('Database connection established');
    client.release();
  })
  .catch(err => {
    logger.error('Failed to connect to database', err);
    process.exit(1); // إنهاء التطبيق إذا فشل الاتصال
  });

// استمع لحدث الاتصال
pool.on('connect', () => {
  logger.info('New database connection established');
});

// استمع لحدث الخطأ
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  // إعادة الاتصال تلقائياً في حالة حدوث خطأ
  setTimeout(() => {
    pool.connect()
      .then(client => {
        logger.info('Reconnected to database');
        client.release();
      })
      .catch(reconnectErr => {
        logger.error('Failed to reconnect to database', reconnectErr);
      });
  }, 5000);
});

/**
 * تنفيذ استعلام SQL
 * @param {string} text - نص الاستعلام
 * @param {Array} params - معاملات الاستعلام
 * @returns {Promise} - نتيجة الاستعلام
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Executed query', {
      text,
      duration: `${duration}ms`,
      rows: result.rowCount
    });

    return result;
  } catch (err) {
    logger.error('Query error', {
      text,
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

/**
 * بدء معاملة
 * @returns {Promise} - كائن العميل للمعاملة
 */
async function beginTransaction() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.debug('Transaction started');
    return client;
  } catch (err) {
    logger.error('Failed to start transaction', err);
    client.release();
    throw err;
  }
}

/**
 * تنفيذ استعلام داخل معاملة
 * @param {Object} client - كائن العميل للمعاملة
 * @param {string} text - نص الاستعلام
 * @param {Array} params - معاملات الاستعلام
 * @returns {Promise} - نتيجة الاستعلام
 */
async function transactionQuery(client, text, params) {
  const start = Date.now();
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;

    logger.debug('Executed transaction query', {
      text,
      duration: `${duration}ms`,
      rows: result.rowCount
    });

    return result;
  } catch (err) {
    logger.error('Transaction query error', {
      text,
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

/**
 إنهاء المعاملة بنجاح
 * @param {Object} client - كائن العميل للمعاملة
 */
async function commitTransaction(client) {
  try {
    await client.query('COMMIT');
    logger.debug('Transaction committed');
    client.release();
  } catch (err) {
    logger.error('Failed to commit transaction', err);
    client.release();
    throw err;
  }
}

/**
 * التراجع عن المعاملة
 * @param {Object} client - كائن العميل للمعاملة
 */
async function rollbackTransaction(client) {
  try {
    await client.query('ROLLBACK');
    logger.debug('Transaction rolled back');
    client.release();
  } catch (err) {
    logger.error('Failed to rollback transaction', err);
    client.release();
    throw err;
  }
}

module.exports = {
  query,
  beginTransaction,
  transactionQuery,
  commitTransaction,
  rollbackTransaction,
  pool
};
