const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

/**
 * Reset DB by re-running schema.sql + seed.sql.
 * Uses DATABASE_URL_TEST if present, otherwise DATABASE_URL.
 */
async function resetDb() {
  const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL_TEST o DATABASE_URL non impostata.');
  }

  const ssl =
    process.env.DATABASE_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false;

  const client = new Client({ connectionString, ssl });
  await client.connect();

  const root = path.join(__dirname, '..', '..', '..'); // project root
  const schemaPath = path.join(root, 'db', 'schema.sql');
  const seedPath = path.join(root, 'db', 'seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  // schema.sql contiene DROP/CREATE, quindi pulisce sempre
  await client.query(schemaSql);
  await client.query(seedSql);

  await client.end();
}

module.exports = { resetDb };
