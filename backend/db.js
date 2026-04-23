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
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
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
      )
    `);

    // Experience table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experience (
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
      )
    `);

    // Education table
    await client.query(`
      CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        degree TEXT,
        field TEXT,
        institution TEXT,
        location TEXT,
        start_year TEXT,
        end_year TEXT,
        grade TEXT
      )
    `);

    // Skills table
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        category TEXT,
        level TEXT
      )
    `);

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        description TEXT,
        tech_stack TEXT[],
        live_url TEXT,
        github_url TEXT,
        image_urls TEXT[],
        featured BOOLEAN DEFAULT FALSE
      )
    `);

    // Achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        issuer TEXT,
        date TEXT,
        description TEXT,
        category TEXT
      )
    `);

    console.log('✅ Database tables ready');
  } catch (error) {
    console.error('Database init error:', error);
  } finally {
    client.release();
  }
}

initDatabase();

export default pool;