import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = express.Router();
router.use(authenticate);

// Get user's cover letter preferences
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT career_goals, notice_period, preferred_work_env FROM user_cover_data WHERE user_id = $1',
      [req.userId]
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user's cover letter preferences
router.put('/', async (req, res) => {
  try {
    const { career_goals, notice_period, preferred_work_env } = req.body;
    await pool.query(
      `INSERT INTO user_cover_data (user_id, career_goals, notice_period, preferred_work_env, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         career_goals = EXCLUDED.career_goals,
         notice_period = EXCLUDED.notice_period,
         preferred_work_env = EXCLUDED.preferred_work_env,
         updated_at = NOW()`,
      [req.userId, career_goals, notice_period, preferred_work_env]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
