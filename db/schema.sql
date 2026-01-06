-- MentorMatch schema (PostgreSQL)
-- Nota: usare timestamptz per gestire fusi orari correttamente.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS mentor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('MENTOR','MENTEE')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mentor_profiles (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline    TEXT NOT NULL DEFAULT '',
  sector      TEXT NOT NULL DEFAULT '',
  bio         TEXT NOT NULL DEFAULT '',
  languages   TEXT NOT NULL DEFAULT '' -- es: "IT, EN"
);

CREATE TABLE availability_slots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('OPEN','BOOKED')) DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT slot_time_ok CHECK (end_time > start_time)
);

CREATE INDEX idx_slots_mentor_time ON availability_slots(mentor_id, start_time);

CREATE TABLE bookings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id      UUID NOT NULL UNIQUE REFERENCES availability_slots(id) ON DELETE CASCADE,
  mentor_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL CHECK (status IN ('BOOKED','CANCELLED','DONE')) DEFAULT 'BOOKED',
  meeting_link TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_mentor ON bookings(mentor_id, created_at);
CREATE INDEX idx_bookings_mentee ON bookings(mentee_id, created_at);

CREATE TABLE reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  mentor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating     INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_mentor ON reviews(mentor_id, created_at);
