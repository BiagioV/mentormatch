const express = require('express');
const { pool } = require('../db/pool');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews  { booking_id, rating, comment }
router.post('/', requireRole('MENTEE'), async (req, res) => {
  try {
    const menteeId = req.session.user.id;
    const { booking_id, rating, comment } = req.body;
    const rNum = Number(rating);
    if (!booking_id || !Number.isInteger(rNum) || rNum < 1 || rNum > 5) {
      return res.status(400).json({ error: 'DATI_NON_VALIDI' });
    }

    // Verifica booking appartenga al mentee e sia conclusa (end_time < now) e non cancellata
    const bR = await pool.query(
      `SELECT b.id, b.mentor_id, b.mentee_id, b.status, s.end_time
       FROM bookings b
       JOIN availability_slots s ON s.id = b.slot_id
       WHERE b.id=$1`,
      [booking_id]
    );
    if (bR.rowCount === 0) return res.status(404).json({ error: 'BOOKING_NON_TROVATA' });

    const b = bR.rows[0];
    if (b.mentee_id !== menteeId) return res.status(403).json({ error: 'NON_AUTORIZZATO' });
    if (b.status !== 'BOOKED' && b.status !== 'DONE') return res.status(409).json({ error: 'NON_RECENSIBILE' });
    if (new Date(b.end_time) > new Date()) return res.status(409).json({ error: 'SESSIONE_NON_CONCLUSA' });

    const ins = await pool.query(
      `INSERT INTO reviews (booking_id, mentor_id, mentee_id, rating, comment)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, rating, comment, created_at`,
      [booking_id, b.mentor_id, menteeId, rNum, comment || '']
    );

    res.json({ review: ins.rows[0] });
  } catch (e) {
    if (String(e).includes('duplicate key')) {
      return res.status(409).json({ error: 'RECENSIONE_GIA_PRESENTE' });
    }
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

module.exports = router;
