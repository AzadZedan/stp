/**
 * إدارة المعاملات في قاعدة البيانات
 */

const {
  beginTransaction,
  transactionQuery,
  commitTransaction,
  rollbackTransaction
} = require('./connection');

const logger = require('../utils/logger');

/**
 * إنشاء معاملة جديدة في قاعدة البيانات
 * @param {Object} transactionData - بيانات المعاملة
 * @returns {Promise} - المعاملة المنشأة
 */
async function createTransaction(transactionData) {
  let client;
  try {
    // بدء معاملة
    client = await beginTransaction();

    // إدخال المعاملة في قاعدة البيانات
    const insertQuery = `
      INSERT INTO transactions (
        id, amount, currency, recipient, sender, status, timestamp, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      transactionData.id,
      transactionData.amount,
      transactionData.currency,
      transactionData.recipient,
      transactionData.sender,
      transactionData.status,
      transactionData.timestamp,
      JSON.stringify(transactionData.details || {})
    ];

    const result = await transactionQuery(client, insertQuery, values);

    // التأكيد على المعاملة
    await commitTransaction(client);

    logger.info('Transaction created', {
      transactionId: transactionData.id
    });

    return result.rows[0];
  } catch (err) {
    // التراجع عن المعاملة في حالة حدوث خطأ
    if (client) {
      await rollbackTransaction(client);
    }

    logger.error('Failed to create transaction', {
      error: err.message,
      stack: err.stack,
      transactionData
    });

    throw err;
  }
}

/**
 * الحصول على قائمة بالمعاملات
 * @param {Object} params - معلمات التصفية والترتيب
 * @returns {Promise} - قائمة المعاملات
 */
async function getTransactions(params = {}) {
  const {
    limit = 10,
    offset = 0,
    status,
    currency,
    sender,
    recipient,
    sortBy = 'timestamp',
    sortOrder = 'DESC'
  } = params;

  try {
    // بناء استعلام الحصول على المعاملات
    let query = `
      SELECT 
        t.id, t.amount, t.currency, t.recipient, t.sender, 
        t.status, t.timestamp, t.details,
        COUNT(*) OVER() as total_count
      FROM transactions t
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // إضافة شروط التصفية
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (currency) {
      query += ` AND t.currency = $${paramIndex}`;
      queryParams.push(currency);
      paramIndex++;
    }

    if (sender) {
      query += ` AND t.sender = $${paramIndex}`;
      queryParams.push(sender);
      paramIndex++;
    }

    if (recipient) {
      query += ` AND t.recipient = $${paramIndex}`;
      queryParams.push(recipient);
      paramIndex++;
    }

    // إضافة الترتيب
    query += ` ORDER BY t.${sortBy} ${sortOrder}`;

    // إضافة التصفح
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await transactionQuery(null, query, queryParams);

    logger.debug('Fetched transactions', {
      limit,
      offset,
      count: result.rows.length
    });

    return result.rows;
  } catch (err) {
    logger.error('Failed to fetch transactions', {
      error: err.message,
      stack: err.stack,
      params
    });

    throw err;
  }
}

/**
 * الحصول على معاملة محددة
 * @param {string} id - معرف المعاملة
 * @returns {Promise} - المعاملة المحددة
 */
async function getTransactionById(id) {
  try {
    const query = `
      SELECT * FROM transactions WHERE id = $1
    `;

    const result = await transactionQuery(null, query, [id]);

    if (result.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.name = 'NotFoundError';
      throw error;
    }

    logger.debug('Fetched transaction', {
      transactionId: id
    });

    return result.rows[0];
  } catch (err) {
    logger.error('Failed to fetch transaction', {
      error: err.message,
      stack: err.stack,
      transactionId: id
    });

    throw err;
  }
}

/**
 * تحديث حالة معاملة
 * @param {string} id - معرف المعاملة
 * @param {string} status - الحالة الجديدة
 * @param {Object} details - تفاصيل إضافية
 * @returns {Promise} - المعلمة المحدثة
 */
async function updateTransactionStatus(id, status, details = {}) {
  let client;
  try {
    // بدء معاملة
    client = await beginTransaction();

    const updateQuery = `
      UPDATE transactions 
      SET status = $1, details = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const result = await transactionQuery(client, updateQuery, [
      status,
      JSON.stringify(details),
      id
    ]);

    if (result.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.name = 'NotFoundError';
      throw error;
    }

    // التأكيد على المعاملة
    await commitTransaction(client);

    logger.info('Transaction status updated', {
      transactionId: id,
      newStatus: status
    });

    return result.rows[0];
  } catch (err) {
    // التراجع عن المعاملة في حالة حدوث خطأ
    if (client) {
      await rollbackTransaction(client);
    }

    logger.error('Failed to update transaction status', {
      error: err.message,
      stack: err.stack,
      transactionId: id,
      status
    });

    throw err;
  }
}

/**
 * الحصول على إحصائيات المعاملات
 * @param {Object} params - معلمات التصفية
 * @returns {Promise} - الإحصائيات
 */
async function getTransactionStats(params = {}) {
  try {
    // بناء استعلام الإحصائيات
    let query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_transactions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
      FROM transactions
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // إضافة شروط التصفية
    if (params.currency) {
      query += ` AND currency = $${paramIndex}`;
      queryParams.push(params.currency);
      paramIndex++;
    }

    if (params.since) {
      query += ` AND timestamp >= $${paramIndex}`;
      queryParams.push(params.since);
      paramIndex++;
    }

    const result = await transactionQuery(null, query, queryParams);

    logger.debug('Fetched transaction statistics');

    return result.rows[0];
  } catch (err) {
    logger.error('Failed to fetch transaction statistics', {
      error: err.message,
      stack: err.stack,
      params
    });

    throw err;
  }
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
  getTransactionStats
};
