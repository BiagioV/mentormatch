const request = require('supertest');
const app = require('../app');
const { resetDb } = require('./helpers/resetDb');

beforeEach(async () => {
  await resetDb();
});

describe('Mentors', () => {
  test('GET /api/mentors ritorna Mario e almeno 1 slot OPEN', async () => {
    const r = await request(app).get('/api/mentors');
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.mentors)).toBe(true);

    const mario = r.body.mentors.find(m => m.email === 'mario@example.it');
    expect(mario).toBeTruthy();
    expect(Number(mario.open_slots)).toBeGreaterThanOrEqual(1);
  });

  test('Filtro hasAvailability=1 ritorna solo mentor con slot disponibili', async () => {
    const r = await request(app).get('/api/mentors?hasAvailability=1');
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body.mentors)).toBe(true);
    expect(r.body.mentors.length).toBeGreaterThan(0);
    for (const m of r.body.mentors) {
      expect(Number(m.open_slots)).toBeGreaterThan(0);
    }
  });
});
