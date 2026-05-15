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

describe('E2E Tests - Orders', () => {
  let authToken;
  let restaurantId;
  let productId;

  beforeAll(async () => {
    // Criar usuário de teste
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
        phone: '+5511999999999',
      });

    authToken = userResponse.body.data.token;

    // Criar restaurante
    const restaurantResponse = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Restaurant',
        description: 'Test Description',
        cuisine: 'Italian',
        address: {
          street: 'Test Street',
          number: '123',
          neighborhood: 'Center',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        phone: '+5511999999999',
        deliveryFee: 5.0,
        minOrder: 20.0,
      });

    restaurantId = restaurantResponse.body.data._id;

    // Criar produto
    const productResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        restaurant: restaurantId,
        name: 'Test Product',
        description: 'Test Description',
        price: 30.0,
        category: 'Main Course',
      });

    productId = productResponse.body.data._id;
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        restaurant: restaurantId,
        items: [
          {
            product: productId,
            quantity: 2,
          },
        ],
        deliveryAddress: {
          street: 'Delivery Street',
          number: '456',
          neighborhood: 'Neighborhood',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        paymentMethod: 'credit_card',
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ restaurant: restaurantId, items: [] });

      expect(response.status).toBe(401);
    });

    it('should fail with empty items', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          restaurant: restaurantId,
          items: [],
          deliveryAddress: {
            street: 'Test',
            number: '123',
            neighborhood: 'Center',
            city: 'SP',
            state: 'SP',
            zipCode: '01234-567',
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status', async () => {
      // Primeiro criar um pedido
      const orderData = {
        restaurant: restaurantId,
        items: [{ product: productId, quantity: 1 }],
        deliveryAddress: {
          street: 'Test',
          number: '123',
          neighborhood: 'Center',
          city: 'SP',
          state: 'SP',
          zipCode: '01234-567',
        },
        paymentMethod: 'credit_card',
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      const orderId = orderResponse.body.data._id;

      // Atualizar status
      const statusResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' });

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.status).toBe('confirmed');
    });
  });
});
