const request = require('supertest');
const app = require('../src/app');

describe('shipit', () => {
  test('GET /healthz returns ok', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /api/info reports build metadata', async () => {
    process.env.GIT_SHA = 'abc123';
    process.env.APP_VERSION = '1.0.7';
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
    expect(res.body.commit).toBe('abc123');
    expect(res.body.version).toBe('1.0.7');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  test('GET / serves the UI', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('ShipIt');
  });

  test('unknown routes return 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});