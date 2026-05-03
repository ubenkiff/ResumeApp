import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      subscription_status TEXT DEFAULT 'free',
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // Profiles table
    await client.query(`CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      name TEXT,
      title TEXT,
      bio TEXT,
      email TEXT,
      phone TEXT,
      location TEXT,
      linkedin TEXT,
      avatar_url TEXT
    )`);

    // Experience table
    await client.query(`CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company TEXT,
      location TEXT,
      start_date TEXT,
      end_date TEXT,
      current BOOLEAN DEFAULT FALSE,
      description TEXT,
      highlights TEXT[]
    )`);

    // Education table
    await client.query(`CREATE TABLE IF NOT EXISTS education (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      degree TEXT,
      field TEXT,
      institution TEXT,
      location TEXT,
      start_year TEXT,
      end_year TEXT,
      grade TEXT,
      description TEXT
    )`);

    // Skills table
    await client.query(`CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT,
      category TEXT,
      level TEXT
    )`);

    // Projects table
    await client.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      description TEXT,
      tech_stack TEXT[],
      live_url TEXT,
      github_url TEXT,
      image_urls TEXT[],
      featured BOOLEAN DEFAULT FALSE
    )`);

    // Achievements table
    await client.query(`CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title TEXT,
      issuer TEXT,
      date TEXT,
      description TEXT,
      category TEXT
    )`);

    // NEW: User cover letter preferences
    await client.query(`CREATE TABLE IF NOT EXISTS user_cover_data (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      career_goals TEXT,
      notice_period TEXT,
      preferred_work_env TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Saved cover letters
    await client.query(`CREATE TABLE IF NOT EXISTS saved_cover_letters (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company_name TEXT,
      job_description TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Saved jobs from InfraScan
    await client.query(`CREATE TABLE IF NOT EXISTS saved_jobs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      job_title TEXT,
      company_name TEXT,
      location TEXT,
      description TEXT,
      source_url TEXT,
      saved_at TIMESTAMP DEFAULT NOW()
    )`);

    // NEW: Email logs (for monitoring)
    await client.query(`CREATE TABLE IF NOT EXISTS email_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      recipient_email TEXT,
      email_type TEXT,
      status TEXT,
      error_message TEXT,
      sent_at TIMESTAMP DEFAULT NOW()
    )`);

    // References table
    await client.query(`CREATE TABLE IF NOT EXISTS user_references (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      title TEXT,
      company TEXT,
      email TEXT,
      phone TEXT,
      relationship TEXT,
      include_in_letter BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0
    )`);

    // NEW: Admin users
    await client.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE
    )`);

    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('Database init error:', error);
  } finally {
    client.release();
  }
}

initDatabase();

export default pool;
