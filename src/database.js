/**
 * Database Module
 * 
 * Handles all database operations.
 * User management, logging, and queries.
 */

/**
 * Initialize database tables
 */
export async function initializeDatabase(db) {
  try {
    // Users table
    await db.exec(`
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
      )
    `);

    // Logs table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS registration_logs (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (telegram_id) REFERENCES users(telegram_id)
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    if (error.message && error.message.includes('already exists')) {
      console.log('Tables already exist');
      return;
    }
    throw new Error(`Database initialization failed: ${error.message}`);
  }
}

/**
 * Get user by Telegram ID
 */
export async function getUser(db, telegramId) {
  try {
    const user = await db
      .prepare('SELECT * FROM users WHERE telegram_id = ?')
      .bind(telegramId)
      .first();

    if (!user) {
      // Create new user
      await db
        .prepare(
          'INSERT INTO users (telegram_id, state) VALUES (?, ?)'
        )
        .bind(telegramId, 'START')
        .run();

      return {
        id: null,
        telegram_id: telegramId,
        state: 'START',
        name: null,
        national_id: null,
        field: null,
        education_level: null,
        phone: null,
        document_file_id: null,
        document_type: null,
        document_verified: 0,
        payment_receipt_file_id: null,
        payment_verified: 0,
        registration_completed: 0,
      };
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

/**
 * Update user state
 */
export async function updateUserState(db, telegramId, state) {
  try {
    await db
      .prepare('UPDATE users SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?')
      .bind(state, telegramId)
      .run();
  } catch (error) {
    console.error('Update user state error:', error);
    throw error;
  }
}

/**
 * Update user data
 */
export async function updateUser(db, telegramId, data) {
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?`;
    
    await db
      .prepare(query)
      .bind(...values, telegramId)
      .run();
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}

/**
 * Log registration action
 */
export async function logAction(db, telegramId, action, details = null) {
  try {
    await db
      .prepare(
        'INSERT INTO registration_logs (telegram_id, action, details) VALUES (?, ?, ?)'
      )
      .bind(telegramId, action, details)
      .run();
  } catch (error) {
    console.error('Log action error:', error);
    throw error;
  }
}

/**
 * Get user by national ID
 */
export async function getUserByNationalId(db, nationalId) {
  try {
    return await db
      .prepare('SELECT * FROM users WHERE national_id = ?')
      .bind(nationalId)
      .first();
  } catch (error) {
    console.error('Get user by national ID error:', error);
    throw error;
  }
}

/**
 * Get all registered users
 */
export async function getRegisteredUsers(db) {
  try {
    return await db
      .prepare('SELECT * FROM users WHERE registration_completed = 1')
      .all();
  } catch (error) {
    console.error('Get registered users error:', error);
    throw error;
  }
}

/**
 * Get registration logs for user
 */
export async function getUserLogs(db, telegramId) {
  try {
    return await db
      .prepare('SELECT * FROM registration_logs WHERE telegram_id = ? ORDER BY timestamp DESC')
      .bind(telegramId)
      .all();
  } catch (error) {
    console.error('Get user logs error:', error);
    throw error;
  }
}

export default {
  initializeDatabase,
  getUser,
  updateUserState,
  updateUser,
  logAction,
  getUserByNationalId,
  getRegisteredUsers,
  getUserLogs,
};