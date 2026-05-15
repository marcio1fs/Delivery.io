import request from 'supertest';
import { app, server } from '../../src/server.js';
import User from '../../src/models/User.js';
import connectDB from '../../src/config/database.js';
import redisClient from '../../src/config/redis.js';

let authToken = '';
let testUser = null;

beforeAll(async () => {
  await connectDB();
  try {
    await redisClient.connect();
  } catch (error) {
    console.warn('Redis connection failed in tests:', error.message);
  }
});

afterAll(async () => {
  if (testUser) {
    await User.findByIdAndDelete(testUser._id);
  }
  server.close();
  await redisClient.disconnect();
});

describe('Restaurant API', () => {
  beforeAll(async () => {
    // Create a restaurant user for testing
    testUser = await User.create({
      name: 'Test Restaurant Owner',
      email: `restaurant_${Date.now()}@test.com`,
      password: 'password123',
      role: 'restaurant',
      phone: '+1234567890',
      isVerified: true,
      isActive: true
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authToken = loginRes.body.data.token;
  });

  describe('POST /api/restaurants', () => {
    it('should create a new restaurant', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: {
          street: '123 Test St',
          number: '123',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345-678',
          country: 'Brazil'
        },
        cuisine: 'Italian',
        deliveryTime: {
          min: 20,
          max: 40
        },
        minimumOrder: 15.00,
        deliveryFee: 5.00,
        openingHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' }
        },
        images: ['https://example.com/image.jpg']
      };

      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(restaurantData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurant).toHaveProperty('_id');
      expect(res.body.data.restaurant.name).toBe('Test Restaurant');
      expect(res.body.data.restaurant.owner).toBeDefined();

      // Store restaurant ID for later tests
      global.testRestaurantId = res.body.data.restaurant._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/restaurants', () => {
    it('should get all restaurants (public)', async () => {
      const res = await request(app)
        .get('/api/restaurants');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('restaurants');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should filter by search query', async () => {
      const res = await request(app)
        .get('/api/restaurants?search=Test');

      expect(res.status).toBe(200);
      expect(res.body.data.restaurants).toBeInstanceOf(Array);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/restaurants?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/restaurants/:id', () => {
    it('should get a single restaurant', async () => {
      if (!global.testRestaurantId) return;

      const res = await request(app)
        .get(`/api/restaurants/${global.testRestaurantId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurant).toHaveProperty('_id', global.testRestaurantId);
    });

    it('should return 404 for non-existent restaurant', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/restaurants/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/restaurants/:id', () => {
    it('should update a restaurant', async () => {
      if (!global.testRestaurantId) return;

      const updateData = {
        name: 'Updated Restaurant Name',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/restaurants/${global.testRestaurantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurant.name).toBe('Updated Restaurant Name');
    });

    it('should fail if not owner', async () => {
      if (!global.testRestaurantId) return;

      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: `other_${Date.now()}@test.com`,
        password: 'password123',
        role: 'restaurant',
        isVerified: true,
        isActive: true
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: otherUser.email,
          password: 'password123'
        });

      const otherToken = loginRes.body.data.token;

      const res = await request(app)
        .put(`/api/restaurants/${global.testRestaurantId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Name' });

      expect(res.status).toBe(403);

      await User.findByIdAndDelete(otherUser._id);
    });
  });

  describe('PATCH /api/restaurants/:id/status', () => {
    it('should toggle restaurant status', async () => {
      if (!global.testRestaurantId) return;

      const res = await request(app)
        .patch(`/api/restaurants/${global.testRestaurantId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('isOpen');
    });
  });

  describe('DELETE /api/restaurants/:id', () => {
    it('should fail for non-admin user', async () => {
      if (!global.testRestaurantId) return;

      const res = await request(app)
        .delete(`/api/restaurants/${global.testRestaurantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });
});
