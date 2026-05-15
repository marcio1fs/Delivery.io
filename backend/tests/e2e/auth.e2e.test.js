import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../../src/server.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('E2E Tests - Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        phone: '+5511999999999',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('_id');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should fail with existing email', async () => {
      const userData = {
        name: 'Test User 2',
        email: 'test@email.com',
        password: 'password123',
      };

      // Primeiro registro
      await request(app).post('/api/auth/register').send(userData);

      // Segundo registro com mesmo email
      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const userData = {
        name: 'Test User 3',
        email: 'test3@email.com',
        password: '123',
      };

      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Criar usuário para teste de login
      await request(app).post('/api/auth/register').send({
        name: 'Login Test User',
        email: 'login@email.com',
        password: 'password123',
      });
    });

    it('should login successfully', async () => {
      const credentials = {
        email: 'login@email.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should fail with wrong password', async () => {
      const credentials = {
        email: 'login@email.com',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@email.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(401);
    });
  });
});
