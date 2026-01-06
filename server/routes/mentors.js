const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

// GET /api/mentors?sector=&language=&minRating=&hasAvailability=1
router.get('/', async (req, res) => {
  try {
    const { sector, language, minRating, hasAvailability } = req.query;

    const where = [`u.role='MENTOR'`];
    const params = [];
    let i = 1;

    if (sector) { where.push(`mp.sector ILIKE '%' || $${i++} || '%'`); params.push(sector); }
    if (language) { where.push(`mp.languages ILIKE '%' || $${i++} || '%'`); params.push(language); }

    // Base query
    let q = `
      SELECT
        u.id, u.name, u.email,
        mp.headline, mp.sector, mp.languages,
        COALESCE(AVG(r.rating),0)::float AS avg_rating,
        COUNT(DISTINCT s.id) FILTER (WHERE s.status='OPEN' AND s.start_time > now()) AS open_slots
      FROM users u
      JOIN mentor_profiles mp ON mp.user_id = u.id
      LEFT JOIN reviews r ON r.mentor_id = u.id
      LEFT JOIN availability_slots s ON s.mentor_id = u.id
      WHERE ${where.join(' AND ')}
      GROUP BY u.id, mp.headline, mp.sector, mp.languages
    `;

    const having = [];
    if (minRating) { having.push(`COALESCE(AVG(r.rating),0) >= $${i++}`); params.push(Number(minRating)); }
    if (hasAvailability === '1') { having.push(`COUNT(DISTINCT s.id) FILTER (WHERE s.status='OPEN' AND s.start_time > now()) > 0`); }

    if (having.length) q += ` HAVING ${having.join(' AND ')}`;

    q += ` ORDER BY avg_rating DESC, u.name ASC LIMIT 100`;

    const r = await pool.query(q, params);
    res.json({ mentors: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

// GET /api/mentors/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const q = `
      SELECT
        u.id, u.name, u.email,
        mp.headline, mp.sector, mp.bio, mp.languages,
        COALESCE(AVG(r.rating),0)::float AS avg_rating,
        COUNT(r.id) AS reviews_count
      FROM users u
      JOIN mentor_profiles mp ON mp.user_id = u.id
      LEFT JOIN reviews r ON r.mentor_id = u.id
      WHERE u.id=$1 AND u.role='MENTOR'
      GROUP BY u.id, mp.headline, mp.sector, mp.bio, mp.languages
    `;
    const r = await pool.query(q, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'MENTOR_NON_TROVATO' });

    res.json({ mentor: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

// GET /api/mentors/:id/slots
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `SELECT id, start_time, end_time, status
       FROM availability_slots
       WHERE mentor_id=$1 AND start_time > now()
       ORDER BY start_time ASC`,
      [id]
    );
    res.json({ slots: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

// GET /api/mentors/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(
      `SELECT rating, comment, created_at
       FROM reviews
       WHERE mentor_id=$1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );
    res.json({ reviews: r.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

module.exports = router;
