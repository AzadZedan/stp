/**
 * مثال على استخدام واجهة برمجة التطبيقات الأساسية لـ Stampcoin Platform
 * هذا المثال يوضح كيفية إنشاء معاملة والحصول على قائمة بالمعاملات
 */

const axios = require('axios');

// إعداد عنوان الخادم
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * الحصول على حالة الخادم
 */
async function getServerStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/status`);
    console.log('Server status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching server status:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * إنشاء معاملة جديدة
 */
async function createTransaction(transactionData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/transaction`, transactionData);
    console.log('Transaction created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * الحصول على قائمة بالمعاملات
 */
async function getTransactions(params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`, { params });
    console.log('Transactions:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * الحصول على تفاصيل معاملة محددة
 */
async function getTransactionDetails(transactionId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/${transactionId}`);
    console.log('Transaction details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * دالة رئيسية لتشغيل الأمثلة
 */
async function main() {
  try {
    // التحقق من حالة الخادم
    await getServerStatus();

    // إنشاء معاملة جديدة
    const transactionData = {
      amount: 100,
      currency: 'STAMP',
      recipient: '0x1234567890abcdef1234567890abcdef12345678',
      sender: '0xabcdef1234567890abcdef1234567890abcdef12'
    };

    const newTransaction = await createTransaction(transactionData);
    const transactionId = newTransaction.transaction.id;

    // الحصول على تفاصيل المعاملة الجديدة
    await getTransactionDetails(transactionId);

    // الحصول على قائمة بالمعاملات
    await getTransactions({ limit: 5, status: 'pending' });

  } catch (error) {
    console.error('Error in main:', error);
  }
}

// تشغيل الدالة الرئيسية إذا كان هذا الملف يتم تشغيله مباشرة
if (require.main === module) {
  main();
}

// تصدير الدوال للاستخدام في ملفات أخرى
module.exports = {
  getServerStatus,
  createTransaction,
  getTransactions,
  getTransactionDetails
};
