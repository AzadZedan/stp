/**
 * إدارة إعدادات التطبيق
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// تحميل الإعدادات الافتراضية من ملف JSON
const defaultConfig = {
  server: {
    port: 3000,
    host: 'localhost'
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'stampcoin_platform',
    user: 'stampcoin_user',
    password: 'secure_password'
  },
  api: {
    rateLimit: {
      windowMs: 900000,
      max: 100
    },
    jwt: {
      secret: 'your_jwt_secret_key',
      expiresIn: '1h'
    }
  },
  transactions: {
    defaultCurrency: 'STAMP',
    minAmount: 1,
    maxAmount: 1000000
  }
};

// تحميل الإعدادات من ملف الإعدادات
function loadConfig() {
  try {
    // تحميل الإعدادات من ملف JSON
    const configPath = path.join(__dirname, 'default.json');
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // دمج الإعدادات من الملف مع الإعدادات الافتراضية
    const mergedConfig = {
      ...defaultConfig,
      ...fileConfig
    };

    // تحميل المتغيرات البيئية إذا كانت موجودة
    if (process.env.PORT) {
      mergedConfig.server.port = parseInt(process.env.PORT);
    }

    if (process.env.DB_HOST) {
      mergedConfig.database.host = process.env.DB_HOST;
    }

    if (process.env.DB_NAME) {
      mergedConfig.database.name = process.env.DB_NAME;
    }

    if (process.env.DB_USER) {
      mergedConfig.database.user = process.env.DB_USER;
    }

    if (process.env.DB_PASSWORD) {
      mergedConfig.database.password = process.env.DB_PASSWORD;
    }

    logger.info('Configuration loaded successfully');
    return mergedConfig;
  } catch (err) {
    logger.error('Failed to load configuration', err);
    return defaultConfig;
  }
}

module.exports = loadConfig();
