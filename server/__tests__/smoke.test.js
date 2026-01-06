const request = require('supertest');
const app = require('../app');

describe('Smoke', () => {
  it('GET /api/auth/me returns user null when not logged', async () => {
    const r = await request(app).get('/api/auth/me');
    expect(r.statusCode).toBe(200);
    expect(r.body.user).toBe(null);
  });
});
