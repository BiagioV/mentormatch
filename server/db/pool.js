const { Pool } = require('pg');

const connectionString =
  (process.env.NODE_ENV === 'test' && process.env.DATABASE_URL_TEST)
    ? process.env.DATABASE_URL_TEST
    : process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = { pool };
