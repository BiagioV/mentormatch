-- Dati demo (seed)
-- Utenti demo (come da README):
-- - Mentor: mario@example.it / MarioRossi25.
-- - Mentee: mentee@example.it / Mentee25.
--
-- Password salvate come bcrypt (10 rounds).

-- 1) Utenti
INSERT INTO users (name, email, password_hash, role) VALUES
('Mario Rossi', 'mario@example.it', '$2b$10$YbPlpkmf9algBfrU47TH0eMJWc/QtHmHOfwA/bhOusL7ummvhUooW', 'MENTOR'),
('Mentee Demo', 'mentee@example.it', '$2b$10$Rifl6EofYlP7/gldg8rGNOW5IDe4F2riSn0fxgi841pnk4ImidzKi', 'MENTEE');

-- 2) Profilo mentor
INSERT INTO mentor_profiles (user_id, headline, sector, bio, languages)
SELECT id,
       'Senior Software Engineer',
       'IT / Software',
       'Ti aiuto con carriera, CV e colloqui (backend, cloud, DevOps).',
       'IT, EN'
FROM users WHERE email='mario@example.it';

-- 3) Slot FUTURI (prenotabili)
INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
SELECT u.id,
       now() + interval '1 day' + interval '10 hours',
       now() + interval '1 day' + interval '11 hours',
       'OPEN'
FROM users u WHERE u.email='mario@example.it';

INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
SELECT u.id,
       now() + interval '2 days' + interval '15 hours',
       now() + interval '2 days' + interval '16 hours',
       'OPEN'
FROM users u WHERE u.email='mario@example.it';

-- 4) Slot PASSATO + booking + review (solo per mostrare rating e recensioni in demo)
-- Slot nel passato (già "BOOKED")
INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
SELECT u.id,
       now() - interval '2 days' + interval '10 hours',
       now() - interval '2 days' + interval '11 hours',
       'BOOKED'
FROM users u WHERE u.email='mario@example.it';

-- Booking collegata allo slot passato
INSERT INTO bookings (slot_id, mentor_id, mentee_id, status, meeting_link, notes)
SELECT s.id, s.mentor_id, me.id, 'DONE', 'https://meet.google.com/abc-defg-hij', 'Booking di esempio (seed)'
FROM availability_slots s
JOIN users me ON me.email='mentee@example.it'
WHERE s.mentor_id = (SELECT id FROM users WHERE email='mario@example.it')
  AND s.start_time < now()
ORDER BY s.start_time DESC
LIMIT 1;

-- Review collegata alla booking
INSERT INTO reviews (booking_id, mentor_id, mentee_id, rating, comment)
SELECT b.id, b.mentor_id, b.mentee_id, 5, 'Ottimo mentor! Sessione chiara e utile.'
FROM bookings b
WHERE b.mentor_id = (SELECT id FROM users WHERE email='mario@example.it')
ORDER BY b.created_at DESC
LIMIT 1;
