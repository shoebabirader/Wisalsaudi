import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './index';
import { connectMongoDB, disconnectMongoDB } from './db/mongodb';

describe('Backend API', () => {
  beforeAll(async () => {
    // Connect to MongoDB before running tests
    try {
      await connectMongoDB();
    } catch (error) {
      console.warn('MongoDB connection failed, some tests may fail:', error);
    }
  });

  afterAll(async () => {
    // Disconnect from MongoDB after tests
    try {
      await disconnectMongoDB();
    } catch (error) {
      console.warn('MongoDB disconnection failed:', error);
    }
  });

  it('should return health check status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('service', 'wisal-backend');
  });

  it('should return API info', async () => {
    const response = await request(app).get('/api');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'WISAL E-Commerce API');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
