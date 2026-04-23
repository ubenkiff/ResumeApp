import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from './db.js';
import { sendEmail } from './email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

app.use(cors());
app.use(express.json());

// Helper function to get client IP
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.socket.remoteAddress || 
         'Unknown';
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, password_hash]
    );
    
    // Create empty profile for user
    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [result.rows[0].id]);
    
    // Generate token
    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET);
    
    // Send welcome email (don't await - don't block response)
    const welcomeData = { username };
    sendEmail(email, 'welcome', welcomeData)
      .then(() => console.log(`Welcome email sent to ${email}`))
      .catch(err => console.error('Welcome email failed:', err.message));
    
    res.json({ user: result.rows[0], token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    // Send login alert email
    const timestamp = new Date().toLocaleString();
    const ip = getClientIp(req);
    const loginData = { username, timestamp, ip };
    sendEmail(user.email, 'loginAlert', loginData)
      .then(() => console.log(`Login alert email sent to ${user.email}`))
      .catch(err => console.error('Login alert email failed:', err.message));
    
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify token middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROFILE ROUTES ============

app.get('/api/profile', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { name, title, bio, email, phone, location, linkedin, avatar_url } = req.body;
    await pool.query(`
      UPDATE profiles SET 
        name = $1, title = $2, bio = $3, email = $4, 
        phone = $5, location = $6, linkedin = $7, avatar_url = $8
      WHERE user_id = $9
    `, [name, title, bio, email, phone, location, linkedin, avatar_url, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EXPERIENCE ROUTES ============

app.get('/api/experience', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM experience WHERE user_id = $1 ORDER BY start_date DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/experience', authenticate, async (req, res) => {
  try {
    const { job_title, company, location, start_date, end_date, current, description, highlights } = req.body;
    const result = await pool.query(`
      INSERT INTO experience (user_id, job_title, company, location, start_date, end_date, current, description, highlights)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.userId, job_title, company, location, start_date, end_date, current, description, highlights]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/experience/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { job_title, company, location, start_date, end_date, current, description, highlights } = req.body;
    await pool.query(`
      UPDATE experience SET 
        job_title = $1, company = $2, location = $3, start_date = $4, 
        end_date = $5, current = $6, description = $7, highlights = $8
      WHERE id = $9 AND user_id = $10
    `, [job_title, company, location, start_date, end_date, current, description, highlights, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/experience/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM experience WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ EDUCATION ROUTES ============

app.get('/api/education', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_year DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/education', authenticate, async (req, res) => {
  try {
    const { degree, field, institution, location, start_year, end_year, grade, description } = req.body;
    const result = await pool.query(`
      INSERT INTO education (user_id, degree, field, institution, location, start_year, end_year, grade, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [req.userId, degree, field, institution, location, start_year, end_year, grade, description]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/education/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, field, institution, location, start_year, end_year, grade, description } = req.body;
    await pool.query(`
      UPDATE education SET 
        degree = $1, field = $2, institution = $3, location = $4, 
        start_year = $5, end_year = $6, grade = $7, description = $8
      WHERE id = $9 AND user_id = $10
    `, [degree, field, institution, location, start_year, end_year, grade, description, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/education/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM education WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SKILLS ROUTES ============

app.get('/api/skills', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY category', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/skills', authenticate, async (req, res) => {
  try {
    const { name, category, level } = req.body;
    const result = await pool.query(`
      INSERT INTO skills (user_id, name, category, level)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [req.userId, name, category, level]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/skills/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level } = req.body;
    await pool.query(`
      UPDATE skills SET name = $1, category = $2, level = $3
      WHERE id = $4 AND user_id = $5
    `, [name, category, level, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/skills/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM skills WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PROJECTS ROUTES ============

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY featured DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authenticate, async (req, res) => {
  try {
    const { title, description, tech_stack, live_url, github_url, image_urls, featured } = req.body;
    const result = await pool.query(`
      INSERT INTO projects (user_id, title, description, tech_stack, live_url, github_url, image_urls, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [req.userId, title, description, tech_stack, live_url, github_url, image_urls, featured || false]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tech_stack, live_url, github_url, image_urls, featured } = req.body;
    await pool.query(`
      UPDATE projects SET 
        title = $1, description = $2, tech_stack = $3, live_url = $4, 
        github_url = $5, image_urls = $6, featured = $7
      WHERE id = $8 AND user_id = $9
    `, [title, description, tech_stack, live_url, github_url, image_urls, featured || false, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ACHIEVEMENTS ROUTES ============

app.get('/api/achievements', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC', [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/achievements', authenticate, async (req, res) => {
  try {
    const { title, issuer, date, description, category } = req.body;
    const result = await pool.query(`
      INSERT INTO achievements (user_id, title, issuer, date, description, category)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [req.userId, title, issuer, date, description, category]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/achievements/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issuer, date, description, category } = req.body;
    await pool.query(`
      UPDATE achievements SET 
        title = $1, issuer = $2, date = $3, description = $4, category = $5
      WHERE id = $6 AND user_id = $7
    `, [title, issuer, date, description, category, id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/achievements/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM achievements WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PUBLIC VIEW ROUTE ============

app.get('/api/public/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userId = userResult.rows[0].id;
    
    const profile = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const experience = await pool.query('SELECT * FROM experience WHERE user_id = $1 ORDER BY start_date DESC', [userId]);
    const education = await pool.query('SELECT * FROM education WHERE user_id = $1 ORDER BY start_year DESC', [userId]);
    const skills = await pool.query('SELECT * FROM skills WHERE user_id = $1 ORDER BY category', [userId]);
    const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY featured DESC', [userId]);
    const achievements = await pool.query('SELECT * FROM achievements WHERE user_id = $1 ORDER BY date DESC', [userId]);
    
    res.json({
      profile: profile.rows[0] || {},
      experience: experience.rows,
      education: education.rows,
      skills: skills.rows,
      projects: projects.rows,
      achievements: achievements.rows
    });
  } catch (error) {
    console.error('Public view error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ResumeApp server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});