-- Dati demo (password: Password!1)
-- Hash generati con bcrypt: $2b$10$9B0P6m7b1N6dMx5mV3yYxO7Ubn1y2rHjXo7bS9Jt5pQ4Czq6d0w3W
-- Nota: questo hash è valido per "Password!1" (bcrypt 10 rounds).

INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Mentor', 'alice.mentor@example.com', '$2b$10$9B0P6m7b1N6dMx5mV3yYxO7Ubn1y2rHjXo7bS9Jt5pQ4Czq6d0w3W', 'MENTOR'),
('Bob Mentee', 'bob.mentee@example.com', '$2b$10$9B0P6m7b1N6dMx5mV3yYxO7Ubn1y2rHjXo7bS9Jt5pQ4Czq6d0w3W', 'MENTEE');
('Mario Rossi', 'mario@example.it', '$2b$10$Axd1n.aRAkT7Nv.L50WyMO2/nyyqjaQ42nSd.sH9lk4.udNVIwgxO', 'MENTEE');
('Mentee', 'mentee@example.it', '$2b$10$EyEIK8irKVwtKpUjXAbqTuX6FzhrDmMyrAaiUS9JIlD9uwwgfIlSq', 'MENTEE');

INSERT INTO mentor_profiles (user_id, headline, sector, bio, languages)
SELECT id, 'Senior DevOps Engineer', 'IT / Cloud', 'Ti aiuto con carriera, CV e colloqui su Cloud/DevOps.', 'IT, EN'
FROM users WHERE email='alice.mentor@example.com';

-- Slot demo per Alice (prossimi giorni)
INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
SELECT u.id,
       now() + interval '1 day' + interval '10 hours',
       now() + interval '1 day' + interval '11 hours',
       'OPEN'
FROM users u WHERE u.email='alice.mentor@example.com';

INSERT INTO availability_slots (mentor_id, start_time, end_time, status)
SELECT u.id,
       now() + interval '2 days' + interval '15 hours',
       now() + interval '2 days' + interval '16 hours',
       'OPEN'
FROM users u WHERE u.email='alice.mentor@example.com';
