const request = require('supertest');
const app = require('../app');
const { resetDb } = require('./helpers/resetDb');

beforeEach(async () => {
  await resetDb();
});

describe('Auth', () => {
  test('Login mentee OK e /me ritorna utente', async () => {
    const agent = request.agent(app);

    const login = await agent
      .post('/api/auth/login')
      .send({ email: 'mentee@example.it', password: 'Mentee25.' });

    expect(login.statusCode).toBe(200);
    expect(login.body.user).toBeTruthy();
    expect(login.body.user.email).toBe('mentee@example.it');
    expect(login.body.user.role).toBe('MENTEE');

    const me = await agent.get('/api/auth/me');
    expect(me.statusCode).toBe(200);
    expect(me.body.user).toBeTruthy();
    expect(me.body.user.email).toBe('mentee@example.it');
  });

  test('Login fallisce con password errata', async () => {
    const r = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mentee@example.it', password: 'NOPE' });

    expect(r.statusCode).toBe(401);
    expect(r.body.error).toBe('CREDENZIALI_ERRATE');
  });
});
