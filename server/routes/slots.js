const express = require('express');
const { pool } = require('../db/pool');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/slots  { start_time, end_time }
router.post('/', requireRole('MENTOR'), async (req, res) => {
  try {
    const mentorId = req.session.user.id;
    const { start_time, end_time } = req.body;
    if (!start_time || !end_time) return res.status(400).json({ error: 'DATI_NON_VALIDI' });

    const r = await pool.query(
      `INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
       VALUES ($1,$2,$3,'OPEN')
       RETURNING id, start_time, end_time, status`,
      [mentorId, start_time, end_time]
    );
    res.json({ slot: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

// DELETE /api/slots/:slotId
router.delete('/:slotId', requireRole('MENTOR'), async (req, res) => {
  try {
    const mentorId = req.session.user.id;
    const { slotId } = req.params;

    const r = await pool.query(
      `DELETE FROM availability_slots
       WHERE id=$1 AND mentor_id=$2 AND status='OPEN'
       RETURNING id`,
      [slotId, mentorId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'SLOT_NON_TROVATO_O_NON_ELIMINABILE' });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

module.exports = router;
