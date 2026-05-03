import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../db.js';

const router = express.Router();
router.use(authenticate);

// Get all references for user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_references WHERE user_id = $1 ORDER BY sort_order ASC, id ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a reference
router.post('/', async (req, res) => {
  try {
    const { name, title, company, email, phone, relationship, include_in_letter, sort_order } = req.body;
    const result = await pool.query(
      `INSERT INTO user_references (user_id, name, title, company, email, phone, relationship, include_in_letter, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.userId, name, title, company, email, phone, relationship, include_in_letter || false, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a reference
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, company, email, phone, relationship, include_in_letter, sort_order } = req.body;
    await pool.query(
      `UPDATE user_references SET
        name = $1, title = $2, company = $3, email = $4, phone = $5,
        relationship = $6, include_in_letter = $7, sort_order = $8
       WHERE id = $9 AND user_id = $10`,
      [name, title, company, email, phone, relationship, include_in_letter || false, sort_order || 0, id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle include in letter
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { include_in_letter } = req.body;
    await pool.query(
      'UPDATE user_references SET include_in_letter = $1 WHERE id = $2 AND user_id = $3',
      [include_in_letter, id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a reference
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM user_references WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
