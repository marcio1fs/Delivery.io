import { createClient } from 'redis';
import logger from './logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
        this.connected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      logger.error('Error connecting to Redis:', error.message);
      this.connected = false;
      return null;
    }
  }

  async get(key) {
    if (!this.connected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, expireSeconds = 3600) {
    if (!this.connected || !this.client) return false;
    try {
      await this.client.setEx(key, expireSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.connected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async publish(channel, message) {
    if (!this.connected || !this.client) return false;
    try {
      await this.client.publish(channel, JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Redis PUBLISH error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      logger.info('Redis disconnected');
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
