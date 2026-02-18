/**
 * بيانات البذور (Seed Data) لقاعدة البيانات
 * هذا الملف يستخدم لملء قاعدة البيانات ببيانات أولية للتجربة والاختبار
 */

const { Pool } = require('pg');
const config = require('../config');
const logger = require('../utils/logger');

// إنشاء مجموعة الاتصال
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
});

/**
 * إنشاء بيانات العملات الأولية
 */
async function seedCurrencies() {
  try {
    const currencies = [
      { symbol: 'STAMP', name: 'Stampcoin', decimals: 8 },
      { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
      { symbol: 'ETH', name: 'Ethereum', decimals: 18 }
    ];

    for (const currency of currencies) {
      await pool.query(
        'INSERT INTO currencies (symbol, name, decimals) VALUES ($1, $2, $3) ON CONFLICT (symbol) DO NOTHING',
        [currency.symbol, currency.name, currency.decimals]
      );
    }

    logger.info('Currencies seeded successfully');
  } catch (err) {
    logger.error('Failed to seed currencies', err);
    throw err;
  }
}

/**
 * إنشاء بيانات المستخدمين الأولية
 */
async function seedUsers() {
  try {
    const users = [
      { 
        username: 'admin', 
        email: 'admin@stampcoin.com', 
        password_hash: 'hashed_password_here', 
        wallet_address: '0x1234567890abcdef1234567890abcdef12345678' 
      },
      { 
        username: 'user1', 
        email: 'user1@example.com', 
        password_hash: 'hashed_password_here', 
        wallet_address: '0x9876543210fedcba9876543210fedcba98765432' 
      }
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (username, email, password_hash, wallet_address) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO NOTHING',
        [user.username, user.email, user.password_hash, user.wallet_address]
      );
    }

    logger.info('Users seeded successfully');
  } catch (err) {
    logger.error('Failed to seed users', err);
    throw err;
  }
}

/**
 * إنشاء بيانات المعاملات الأولية
 */
async function seedTransactions() {
  try {
    const transactions = [
      {
        id: 'tx_001',
        amount: 100,
        currency: 'STAMP',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
        sender: '0x9876543210fedcba9876543210fedcba98765432',
        status: 'completed',
        timestamp: new Date('2026-02-17T10:30:00.000Z'),
        details: {
          confirmations: 12,
          blockNumber: 12345,
          gasUsed: 21000
        }
      },
      {
        id: 'tx_002',
        amount: 50,
        currency: 'STAMP',
        recipient: '0x9876543210fedcba9876543210fedcba98765432',
        sender: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'pending',
        timestamp: new Date('2026-02-17T11:15:00.000Z'),
        details: {
          confirmations: 0,
          created_at: new Date('2026-02-17T11:15:00.000Z')
        }
      },
      {
        id: 'tx_003',
        amount: 200,
        currency: 'STAMP',
        recipient: '0xabcdef1234567890abcdef1234567890abcdef12',
        sender: '0x1234567890abcdef1234567890abcdef12345678',
        status: 'failed',
        timestamp: new Date('2026-02-17T09:45:00.000Z'),
        details: {
          confirmations: 0,
          created_at: new Date('2026-02-17T09:45:00.000Z'),
          error: 'Insufficient balance'
        }
      }
    ];

    for (const tx of transactions) {
      await pool.query(
        `INSERT INTO transactions (
          id, amount, currency, recipient, sender, status, timestamp, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
        [
          tx.id,
          tx.amount,
          tx.currency,
          tx.recipient,
          tx.sender,
          tx.status,
          tx.timestamp,
          JSON.stringify(tx.details)
        ]
      );
    }

    logger.info('Transactions seeded successfully');
  } catch (err) {
    logger.error('Failed to seed transactions', err);
    throw err;
  }
}

/**
 * إنشاء بيانات الكتل الأولية
 */
async function seedBlocks() {
  try {
    const blocks = [
      {
        block_number: 12345,
        hash: '0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
        parent_hash: '0xdcba4321dcba4321dcba4321dcba4321dcba4321dcba4321dcba4321dcba4321',
        timestamp: new Date('2026-02-17T10:30:00.000Z'),
        transactions_count: 5
      },
      {
        block_number: 12346,
        hash: '0xefgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678efgh5678',
        parent_hash: '0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
        timestamp: new Date('2026-02-17T11:00:00.000Z'),
        transactions_count: 3
      }
    ];

    for (const block of blocks) {
      await pool.query(
        'INSERT INTO blocks (block_number, hash, parent_hash, timestamp, transactions_count) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (block_number) DO NOTHING',
        [
          block.block_number,
          block.hash,
          block.parent_hash,
          block.timestamp,
          block.transactions_count
        ]
      );
    }

    logger.info('Blocks seeded successfully');
  } catch (err) {
    logger.error('Failed to seed blocks', err);
    throw err;
  }
}

/**
 * تشغيل جميع وظائف التهيئة
 */
async function runSeed() {
  try {
    logger.info('Starting database seeding...');

    // إنشاء العملات
    await seedCurrencies();

    // إنشاء المستخدمين
    await seedUsers();

    // إنشاء المعاملات
    await seedTransactions();

    // إنشاء الكتل
    await seedBlocks();

    logger.info('Database seeding completed successfully');

    // إغلاق الاتصال
    await pool.end();
    logger.info('Database connection closed');

    process.exit(0);
  } catch (err) {
    logger.error('Database seeding failed', err);
    await pool.end();
    process.exit(1);
  }
}

// إذا كان هذا الملف يتم تشغيله مباشرة، قم بتشغيل التهيئة
if (require.main === module) {
  runSeed();
}

module.exports = {
  seedCurrencies,
  seedUsers,
  seedTransactions,
  seedBlocks,
  runSeed
};
