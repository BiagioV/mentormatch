require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const mentorsRoutes = require('./routes/mentors');
const slotsRoutes = require('./routes/slots');
const bookingsRoutes = require('./routes/bookings');
const reviewsRoutes = require('./routes/reviews');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false // in prod dietro https puoi mettere true
  }
}));

// API
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);

// Frontend statico
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback semplice
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => console.log(`MentorMatch running on http://localhost:${port}`));
}

module.exports = app; // per i test
