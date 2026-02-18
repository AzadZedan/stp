/**
 * تهيئة قاعدة البيانات وتنفيذ مخطط الجداول
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const config = require('config');
const logger = require('../utils/logger');

// إنشاء مجموعة الاتصال
const pool = new Pool({
  host: config.get('database.host'),
  port: config.get('database.port'),
  database: config.get('database.name'),
  user: config.get('database.user'),
  password: config.get('database.password'),
});

/**
 * قراءة ملف SQL وتنفيذه
 * @param {string} filePath - مسار ملف SQL
 * @returns {Promise} - نتيجة التنفيذ
 */
async function executeSqlFile(filePath) {
  try {
    // قراءة محتوى ملف SQL
    const sql = fs.readFileSync(filePath, 'utf8');

    // تقسيم SQL إلى عبارات فردية
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    logger.info(`Executing SQL file: ${filePath}`);
    logger.info(`Number of statements: ${statements.length}`);

    // تنفيذ كل عبارة على حدة
    for (const statement of statements) {
      await pool.query(statement);
      logger.debug('Executed SQL statement');
    }

    logger.info(`Successfully executed SQL file: ${filePath}`);
    return true;
  } catch (err) {
    logger.error(`Error executing SQL file: ${filePath}`, err);
    throw err;
  }
}

/**
 * تهيئة قاعدة البيانات
 * @returns {Promise} - نتيجة التهيئة
 */
async function initDatabase() {
  try {
    // التأكد من أن قاعدة البيانات موجودة
    const dbPath = path.join(__dirname, 'schema.sql');

    // تنفيذ مخطط الجداول
    await executeSqlFile(dbPath);

    logger.info('Database initialized successfully');
    return true;
  } catch (err) {
    logger.error('Failed to initialize database', err);
    throw err;
  }
}

/**
 * إغلاق الاتصال بقاعدة البيانات
 */
async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connection closed');
  } catch (err) {
    logger.error('Error closing database connection', err);
    throw err;
  }
}

// إذا كان هذا الملف يتم تشغيله مباشرة، قم بتشغيل التهيئة
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Database initialization completed');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Database initialization failed', err);
      process.exit(1);
    });
}

module.exports = {
  initDatabase,
  closeDatabase,
  executeSqlFile,
  pool
};
