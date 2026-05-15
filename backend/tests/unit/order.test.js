import request from 'supertest';
import { app, server } from '../../src/server.js';
import User from '../../src/models/User.js';
import connectDB from '../../src/config/database.js';

let authToken = '';
let testUser = null;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  if (testUser) {
    await User.findByIdAndDelete(testUser._id);
  }
  server.close();
});

describe('Order API', () => {
  let restaurantId = null;

  beforeAll(async () => {
    // Create a customer user
    testUser = await User.create({
      name: 'Test Customer',
      email: `customer_${Date.now()}@test.com`,
      password: 'password123',
      role: 'customer',
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

    // Create a test restaurant
    const restaurantRes = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Restaurant for Orders',
        description: 'Test restaurant',
        address: {
          street: '123 Test St',
          number: '123',
          neighborhood: 'Test',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345-678',
          country: 'Brazil'
        },
        cuisine: 'Italian',
        deliveryTime: { min: 20, max: 40 },
        minimumOrder: 15.00,
        deliveryFee: 5.00,
        isOpen: true,
        openingHours: {
          monday: { open: '10:00', close: '22:00' }
        }
      });

    restaurantId = restaurantRes.body.data.restaurant._id;
  });

  describe('POST /api/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        restaurant: restaurantId,
        items: [
          {
            product: '507f1f77bcf86cd799439011',
            name: 'Test Product',
            price: 25.00,
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: '456 Customer St',
          number: '456',
          neighborhood: 'Customer Hood',
          city: 'Customer City',
          state: 'CS',
          zipCode: '54321-876',
          country: 'Brazil',
          complement: 'Apt 101'
        },
        paymentMethod: 'card',
        notes: 'No onions please'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(orderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('_id');
      expect(res.body.data.order.status).toBe('pending');
      expect(res.body.data.order.total).toBe(55.00); // 2*25 + 5 delivery

      global.testOrderId = res.body.data.order._id;
    });

    it('should fail with closed restaurant', async () => {
      // First close the restaurant
      await request(app)
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set('Authorization', `Bearer ${authToken}`);

      const orderData = {
        restaurant: restaurantId,
        items: [{ product: '507f1f77bcf86cd799439011', name: 'Test', price: 25, quantity: 1 }],
        deliveryAddress: {
          street: '123 Test St',
          number: '123',
          neighborhood: 'Test',
          city: 'Test',
          state: 'TS',
          zipCode: '12345-678'
        },
        paymentMethod: 'cash'
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(res.status).toBe(400);

      // Reopen restaurant
      await request(app)
        .patch(`/api/restaurants/${restaurantId}/status`)
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ restaurant: restaurantId, items: [] });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toBeInstanceOf(Array);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/orders?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.orders.every(o => o.status === 'pending')).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get a single order', async () => {
      if (!global.testOrderId) return;

      const res = await request(app)
        .get(`/api/orders/${global.testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.order).toHaveProperty('_id', global.testOrderId);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status (restaurant can confirm)', async () => {
      if (!global.testOrderId) return;

      // Need restaurant owner token for this
      const restaurantUser = await User.create({
        name: 'Restaurant Owner',
        email: `owner_${Date.now()}@test.com`,
        password: 'password123',
        role: 'restaurant',
        isVerified: true,
        isActive: true
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: restaurantUser.email, password: 'password123' });

      const restaurantToken = loginRes.body.data.token;

      const res = await request(app)
        .patch(`/api/orders/${global.testOrderId}/status`)
        .set('Authorization', `Bearer ${restaurantToken}`)
        .send({ status: 'confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.data.order.status).toBe('confirmed');

      await User.findByIdAndDelete(restaurantUser._id);
    });

    it('should fail with invalid status transition', async () => {
      if (!global.testOrderId) return;

      const res = await request(app)
        .patch(`/api/orders/${global.testOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'delivered' }); // Can't jump to delivered from confirmed

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    it('should cancel an order', async () => {
      if (!global.testOrderId) return;

      const res = await request(app)
        .delete(`/api/orders/${global.testOrderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Changed my mind' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
