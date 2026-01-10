const request = require('supertest');
const app = require('../app');
const { resetDb } = require('./helpers/resetDb');

beforeEach(async () => {
  await resetDb();
});

describe('Booking flow', () => {
  test('Mentee prenota uno slot OPEN, lo vede in dashboard e poi annulla', async () => {
    const agent = request.agent(app);

    // login mentee
    await agent
      .post('/api/auth/login')
      .send({ email: 'mentee@example.it', password: 'Mentee25.' })
      .expect(200);

    // trova Mario
    const mentors = await agent.get('/api/mentors').expect(200);
    const mario = mentors.body.mentors.find(m => m.email === 'mario@example.it');
    expect(mario).toBeTruthy();

    // trova slot futuri
    const slots = await agent.get(`/api/mentors/${mario.id}/slots`).expect(200);
    expect(slots.body.slots.length).toBeGreaterThan(0);
    const slotId = slots.body.slots[0].id;

    // prenota
    const book = await agent.post('/api/bookings').send({ slot_id: slotId }).expect(200);
    expect(book.body.booking).toBeTruthy();
    expect(book.body.booking.slot_id).toBe(slotId);

    // dashboard
    const mine = await agent.get('/api/bookings/mine').expect(200);
    const found = mine.body.bookings.find(b => b.id === book.body.booking.id);
    expect(found).toBeTruthy();
    expect(found.status).toBe('BOOKED');

    // annulla
    await agent.post(`/api/bookings/${book.body.booking.id}/cancel`).expect(200);

    const mine2 = await agent.get('/api/bookings/mine').expect(200);
    const found2 = mine2.body.bookings.find(b => b.id === book.body.booking.id);
    expect(found2).toBeTruthy();
    expect(found2.status).toBe('CANCELLED');
  });
});
