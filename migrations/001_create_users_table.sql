-- Migration: Create users table
-- Version: 001

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id INTEGER NOT NULL UNIQUE,
  
  -- Registration data
  name TEXT,
  national_id TEXT,
  field TEXT,
  education_level TEXT,
  phone TEXT,
  
  -- File storage
  document_file_id TEXT,
  document_size INTEGER,
  document_mime TEXT,
  
  receipt_file_id TEXT,
  receipt_size INTEGER,
  receipt_mime TEXT,
  
  -- Status tracking
  state TEXT NOT NULL DEFAULT 'START',
  verification_status TEXT DEFAULT NULL, -- pending, approved, rejected
  payment_status TEXT DEFAULT NULL,      -- pending, approved, rejected
  
  -- Timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_state ON users(state);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_payment_status ON users(payment_status);
CREATE INDEX idx_users_updated_at ON users(updated_at);
