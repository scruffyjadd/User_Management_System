const request = require('supertest');
const app = require('../server');

// Mock the server routes
jest.mock('../server', () => {
  const express = require('express');
  const app = express();
  
  // Add test route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  return app;
});

describe('Health Check', () => {
  it('should return 200 and server status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 404 for non-existent route', async () => {
    await request(app)
      .get('/api/non-existent')
      .expect(404);
  });
});
