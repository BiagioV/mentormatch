const express = require('express');
const { pool } = require('../db/pool');
const { requireLogin, requireRole } = require('../middleware/auth');
const { sendBookingEmail, sendCancelEmail } = require('../services/mailer');

const router = express.Router();

// POST /api/bookings  { slot_id }
router.post('/', requireRole('MENTEE'), async (req, res) => {
  const client = await pool.connect();
  try {
    const menteeId = req.session.user.id;
    const { slot_id } = req.body;
    if (!slot_id) return res.status(400).json({ error: 'DATI_NON_VALIDI' });

    await client.query('BEGIN');

    const slotR = await client.query(
      `SELECT s.id, s.mentor_id, s.start_time, s.end_time, s.status,
              u.name AS mentor_name, u.email AS mentor_email
       FROM availability_slots s
       JOIN users u ON u.id = s.mentor_id
       WHERE s.id=$1 FOR UPDATE`,
      [slot_id]
    );
    if (slotR.rowCount === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'SLOT_NON_TROVATO' }); }

    const slot = slotR.rows[0];
    if (slot.status !== 'OPEN') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'SLOT_NON_DISPONIBILE' }); }

    const menteeR = await client.query(`SELECT name, email FROM users WHERE id=$1`, [menteeId]);
    const mentee = menteeR.rows[0];

    const bookingR = await client.query(
      `INSERT INTO bookings (slot_id, mentor_id, mentee_id, status)
       VALUES ($1,$2,$3,'BOOKED')
       RETURNING id, slot_id, mentor_id, mentee_id, status`,
      [slot.id, slot.mentor_id, menteeId]
    );

    await client.query(
      `UPDATE availability_slots SET status='BOOKED' WHERE id=$1`,
      [slot.id]
    );

    await client.query('COMMIT');

    // email (fuori transazione)
    await sendBookingEmail({
      mentorEmail: slot.mentor_email,
      menteeEmail: mentee.email,
      mentorName: slot.mentor_name,
      menteeName: mentee.name,
      startTime: new Date(slot.start_time).toISOString(),
      endTime: new Date(slot.end_time).toISOString()
    });

    res.json({ booking: bookingR.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  } finally {
    client.release();
  }
});

// GET /api/bookings/mine
router.get('/mine', requireLogin, async (req, res) => {
  try {
    const user = req.session.user;
    const now = new Date().toISOString();

    // auto-mark DONE quando lo slot è passato (solo visualmente, non aggiorniamo db qui)
    const r = await pool.query(
      `SELECT
         b.id, b.status, b.meeting_link, b.created_at,
         s.start_time, s.end_time,
         m.id AS mentor_id, m.name AS mentor_name,
         t.id AS mentee_id, t.name AS mentee_name
       FROM bookings b
       JOIN availability_slots s ON s.id = b.slot_id
       JOIN users m ON m.id = b.mentor_id
       JOIN users t ON t.id = b.mentee_id
       WHERE (b.mentor_id=$1 OR b.mentee_id=$1)
       ORDER BY s.start_time ASC`,
      [user.id]
    );

    const bookings = r.rows.map(x => {
      const ended = new Date(x.end_time).toISOString() < now;
      const derivedStatus = (x.status === 'BOOKED' && ended) ? 'DONE' : x.status;
      return { ...x, derived_status: derivedStatus };
    });

    res.json({ bookings });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', requireLogin, async (req, res) => {
  const client = await pool.connect();
  try {
    const user = req.session.user;
    const { id } = req.params;

    await client.query('BEGIN');

    const bR = await client.query(
      `SELECT b.id, b.status, b.mentor_id, b.mentee_id, b.slot_id,
              s.start_time, s.end_time,
              mu.email AS mentor_email, tu.email AS mentee_email
       FROM bookings b
       JOIN availability_slots s ON s.id = b.slot_id
       JOIN users mu ON mu.id = b.mentor_id
       JOIN users tu ON tu.id = b.mentee_id
       WHERE b.id=$1 FOR UPDATE`,
      [id]
    );
    if (bR.rowCount === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'BOOKING_NON_TROVATA' }); }

    const b = bR.rows[0];
    const isOwner = (user.id === b.mentor_id || user.id === b.mentee_id);
    if (!isOwner) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'NON_AUTORIZZATO' }); }
    if (b.status !== 'BOOKED') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'NON_ANNULLABILE' }); }

    await client.query(`UPDATE bookings SET status='CANCELLED' WHERE id=$1`, [id]);
    await client.query(`UPDATE availability_slots SET status='OPEN' WHERE id=$1`, [b.slot_id]);

    await client.query('COMMIT');

    await sendCancelEmail({
      mentorEmail: b.mentor_email,
      menteeEmail: b.mentee_email,
      startTime: new Date(b.start_time).toISOString(),
      endTime: new Date(b.end_time).toISOString()
    });

    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  } finally {
    client.release();
  }
});

// POST /api/bookings/:id/meeting-link  { meeting_link }
router.post('/:id/meeting-link', requireRole('MENTOR'), async (req, res) => {
  try {
    const mentorId = req.session.user.id;
    const { id } = req.params;
    const { meeting_link } = req.body;
    if (!meeting_link || typeof meeting_link !== 'string') return res.status(400).json({ error: 'DATI_NON_VALIDI' });

    const r = await pool.query(
      `UPDATE bookings SET meeting_link=$1
       WHERE id=$2 AND mentor_id=$3
       RETURNING id, meeting_link`,
      [meeting_link, id, mentorId]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'BOOKING_NON_TROVATA' });

    res.json({ booking: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

module.exports = router;
