-- Initial Schema for Congress Bot D1 Database

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  telegram_id INTEGER NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'START',
  name TEXT,
  national_id TEXT UNIQUE,
  field TEXT,
  education_level TEXT,
  phone TEXT,
  document_file_id TEXT,
  document_type TEXT,
  document_verified INTEGER DEFAULT 0,
  payment_receipt_file_id TEXT,
  payment_verified INTEGER DEFAULT 0,
  registration_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_logs (
  id INTEGER PRIMARY KEY,
  telegram_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);
CREATE INDEX IF NOT EXISTS idx_users_registration_completed ON users(registration_completed);
CREATE INDEX IF NOT EXISTS idx_logs_telegram_id ON registration_logs(telegram_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON registration_logs(timestamp);