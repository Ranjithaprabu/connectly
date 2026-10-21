const pool = require("./db");

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      otp_hash TEXT,
      otp_expires_at TIMESTAMPTZ,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Add missing columns to existing databases safely.
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS otp_hash TEXT,
      ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL
        CHECK (char_length(content) BETWEEN 1 AND 4000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(sender_id, receiver_id, created_at)
  `);

  console.log("Database tables are ready.");
}

module.exports = initializeDatabase;