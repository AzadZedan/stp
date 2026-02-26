// Digital Wallet Module for Stampcoin Platform
// Module for managing digital wallets, balances, and transactions

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const WALLETS_FILE = path.join(__dirname, 'wallets.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

/**
 * Initialize wallet storage files if they don't exist
 */
function initializeStorage() {
  if (!fs.existsSync(WALLETS_FILE)) {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

/**
 * Read JSON data from a file
 * @param {string} filePath - Path to the file
 * @param {*} defaultValue - Value to return if file does not exist
 * @returns {*} Parsed JSON data or defaultValue
 */
function readJsonFile(filePath, defaultValue) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Only return default value if file doesn't exist
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    // Re-throw other errors (invalid JSON, permissions, etc.)
    console.error(`Error reading ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Write JSON data to a file
 * @param {string} filePath - Path to the file
 * @param {*} data - Data to serialize and write
 * @returns {boolean} True on success, false on failure
 */
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Read wallets from storage
 */
function readWallets() {
  return readJsonFile(WALLETS_FILE, {});
}

/**
 * Write wallets to storage
 */
function writeWallets(wallets) {
  return writeJsonFile(WALLETS_FILE, wallets);
}

/**
 * Read transactions from storage
 */
function readTransactions() {
  return readJsonFile(TRANSACTIONS_FILE, []);
}

/**
 * Write transactions to storage
 */
function writeTransactions(transactions) {
  return writeJsonFile(TRANSACTIONS_FILE, transactions);
}

/**
 * Create a new wallet for a user
 * @param {string} userId - Unique user identifier
 * @param {string} userName - User's display name
 * @returns {object} The created wallet object
 */
function createWallet(userId, userName) {
  const wallets = readWallets();
  
  if (wallets[userId]) {
    throw new Error('Wallet already exists for this user');
  }

  const wallet = {
    userId,
    userName,
    balance: 0,
    stamps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  wallets[userId] = wallet;
  writeWallets(wallets);
  
  return wallet;
}

/**
 * Get wallet by user ID
 * @param {string} userId - User identifier
 * @returns {object|null} Wallet object or null if not found
 */
function getWallet(userId) {
  const wallets = readWallets();
  return wallets[userId] || null;
}

/**
 * Get all wallets
 * @returns {object} All wallets
 */
function getAllWallets() {
  return readWallets();
}

/**
 * Update wallet balance
 * @param {string} userId - User identifier
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 * @returns {object} Updated wallet
 */
function updateBalance(userId, amount) {
  // Prevent prototype-polluting or otherwise invalid user identifiers
  if (
    typeof userId !== 'string' ||
    userId === '__proto__' ||
    userId === 'constructor' ||
    userId === 'prototype'
  ) {
    throw new Error('Invalid userId');
  }

  const wallets = readWallets();
  const wallet = wallets[userId];
  
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const newBalance = wallet.balance + amount;
  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }

  wallet.balance = newBalance;
  wallet.updatedAt = new Date().toISOString();
  
  wallets[userId] = wallet;
  writeWallets(wallets);
  
  return wallet;
}

/**
 * Add a stamp to wallet
 * @param {string} userId - User identifier
 * @param {object} stamp - Stamp object to add
 * @returns {object} Updated wallet
 */
function addStamp(userId, stamp) {
  const wallets = readWallets();
  const wallet = wallets[userId];
  
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const stampWithId = {
    id: crypto.randomUUID(),
    ...stamp,
    addedAt: new Date().toISOString()
  };

  wallet.stamps.push(stampWithId);
  wallet.updatedAt = new Date().toISOString();
  
  wallets[userId] = wallet;
  writeWallets(wallets);
  
  return wallet;
}

/**
 * Transfer stamps or balance between wallets
 * @param {string} fromUserId - Sender's user ID
 * @param {string} toUserId - Receiver's user ID
 * @param {number} amount - Amount to transfer (must be positive if transferring balance)
 * @param {string} stampId - Stamp ID to transfer (optional)
 * @returns {object} Transaction record
 */
function transfer(fromUserId, toUserId, amount = 0, stampId = null) {
  // Validate that either amount or stampId is provided
  if (!stampId && (!amount || amount <= 0)) {
    throw new Error('Transfer amount must be a positive number when transferring balance');
  }
  
  const wallets = readWallets();
  const fromWallet = wallets[fromUserId];
  const toWallet = wallets[toUserId];
  
  if (!fromWallet || !toWallet) {
    throw new Error('One or both wallets not found');
  }

  const transactionId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // Transfer balance
  if (amount > 0) {
    if (fromWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    fromWallet.balance -= amount;
    toWallet.balance += amount;
  }

  // Transfer stamp
  if (stampId) {
    const stampIndex = fromWallet.stamps.findIndex(s => s.id === stampId);
    if (stampIndex === -1) {
      throw new Error('Stamp not found in sender wallet');
    }
    const stamp = fromWallet.stamps.splice(stampIndex, 1)[0];
    toWallet.stamps.push({
      ...stamp,
      transferredAt: timestamp
    });
  }

  // Update timestamps
  fromWallet.updatedAt = timestamp;
  toWallet.updatedAt = timestamp;
  
  wallets[fromUserId] = fromWallet;
  wallets[toUserId] = toWallet;
  writeWallets(wallets);

  // Record transaction
  const transaction = {
    id: transactionId,
    from: fromUserId,
    to: toUserId,
    amount,
    stampId,
    timestamp,
    status: 'completed'
  };

  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);

  return transaction;
}

/**
 * Get transaction history for a user
 * @param {string} userId - User identifier
 * @returns {array} Array of transactions
 */
function getTransactionHistory(userId) {
  const transactions = readTransactions();
  return transactions.filter(t => t.from === userId || t.to === userId);
}

/**
 * Get all transactions
 * @returns {array} Array of all transactions
 */
function getAllTransactions() {
  return readTransactions();
}

// Initialize storage on module load
initializeStorage();

module.exports = {
  createWallet,
  getWallet,
  getAllWallets,
  updateBalance,
  addStamp,
  transfer,
  getTransactionHistory,
  getAllTransactions
};
