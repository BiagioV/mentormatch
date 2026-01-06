const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../db/pool');

const router = express.Router();

function isEmail(s) {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !isEmail(email) || !password || !['MENTOR','MENTEE'].includes(role)) {
      return res.status(400).json({ error: 'DATI_NON_VALIDI' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'PASSWORD_TROPPO_CORTA' });

    const password_hash = await bcrypt.hash(password, 10);
    const q = `INSERT INTO users (name, email, password_hash, role)
               VALUES ($1,$2,$3,$4)
               RETURNING id, name, email, role`;
    const r = await pool.query(q, [name, email.toLowerCase(), password_hash, role]);

    // Se mentor, crea profilo vuoto
    if (role === 'MENTOR') {
      await pool.query(`INSERT INTO mentor_profiles (user_id) VALUES ($1)`, [r.rows[0].id]);
    }

    req.session.user = r.rows[0];
    res.json({ user: r.rows[0] });
  } catch (e) {
    if (String(e).includes('duplicate key')) {
      return res.status(409).json({ error: 'EMAIL_GIA_USATA' });
    }
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isEmail(email) || !password) return res.status(400).json({ error: 'DATI_NON_VALIDI' });

    const r = await pool.query(
      `SELECT id, name, email, role, password_hash FROM users WHERE email=$1`,
      [email.toLowerCase()]
    );
    if (r.rowCount === 0) return res.status(401).json({ error: 'CREDENZIALI_ERRATE' });

    const ok = await bcrypt.compare(password, r.rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'CREDENZIALI_ERRATE' });

    const user = { id: r.rows[0].id, name: r.rows[0].name, email: r.rows[0].email, role: r.rows[0].role };
    req.session.user = user;
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ERRORE_SERVER' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  res.json({ user: req.session?.user || null });
});

module.exports = router;
