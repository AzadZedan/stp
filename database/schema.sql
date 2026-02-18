-- مخطط قاعدة البيانات لمنصة Stampcoin Platform

-- جدول المعاملات
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    amount NUMERIC(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    recipient VARCHAR(66) NOT NULL, -- عناوين Ethereum تبدأ بـ 0x و 64 حرف
    sender VARCHAR(66) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'created',
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    details JSONB DEFAULT '{}',
    block_number INTEGER,
    gas_used INTEGER,
    confirmations INTEGER DEFAULT 0,
    hash VARCHAR(66) -- معرف المعاملة في الشبكة
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_sender ON transactions(sender);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient ON transactions(recipient);
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(66),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهرس للمستخدمين
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- جدول العملات
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    decimals INTEGER NOT NULL DEFAULT 8,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهرس للعملات
CREATE INDEX IF NOT EXISTS idx_currencies_symbol ON currencies(symbol);
CREATE INDEX IF NOT EXISTS idx_currencies_name ON currencies(name);

-- جدول الكتل
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    block_number INTEGER UNIQUE NOT NULL,
    hash VARCHAR(66) UNIQUE NOT NULL,
    parent_hash VARCHAR(66) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    transactions_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهرس للكتل
CREATE INDEX IF NOT EXISTS idx_blocks_block_number ON blocks(block_number);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp);

-- جدول رسوم المعاملات
CREATE TABLE IF NOT EXISTS transaction_fees (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(255) NOT NULL REFERENCES transactions(id),
    amount NUMERIC(20, 8) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- فهرس لرسوم المعاملات
CREATE INDEX IF NOT EXISTS idx_transaction_fees_transaction_id ON transaction_fees(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_fees_currency ON transaction_fees(currency);

-- جدول السجلات
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(10) NOT NULL, -- error, warn, info, debug
    message TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهرس للسجلات
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- فهرس للإشعارات
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء مشغلات لتحديث updated_at تلقائياً
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at BEFORE UPDATE ON currencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
