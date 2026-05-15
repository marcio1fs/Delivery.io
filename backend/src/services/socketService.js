import express from 'express';
import { Server } from 'socket.io';
import logger from '../utils/logger.js';

const setupSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Store active connections by user ID and role
  const activeConnections = new Map();

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join room based on user ID
    socket.on('authenticate', ({ userId, role }) => {
      if (userId) {
        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);
        
        // Track connection
        if (!activeConnections.has(userId)) {
          activeConnections.set(userId, []);
        }
        activeConnections.get(userId).push(socket.id);
        
        logger.info(`User ${userId} authenticated with role ${role}`);
        
        socket.emit('authenticated', { success: true });
      }
    });

    // Restaurant joins its own room
    socket.on('join-restaurant', ({ restaurantId }) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}`);
        logger.info(`Socket ${socket.id} joined restaurant ${restaurantId}`);
      }
    });

    // Order updates
    socket.on('order-updated', ({ orderId, status, restaurantId }) => {
      // Notify restaurant
      io.to(`restaurant:${restaurantId}`).emit('order-status-changed', {
        orderId,
        status,
        timestamp: new Date(),
      });

      // Notify customer
      io.to(`user:${orderId.customerId}`).emit('order-status-changed', {
        orderId,
        status,
        timestamp: new Date(),
      });

      logger.info(`Order ${orderId} status updated to ${status}`);
    });

    // Rider location updates
    socket.on('rider-location', ({ riderId, location, orderId }) => {
      if (orderId) {
        io.to(`order:${orderId}`).emit('rider-location-update', {
          riderId,
          location,
          timestamp: new Date(),
        });
      }
    });

    // Join order room for tracking
    socket.on('join-order', ({ orderId }) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        logger.info(`Socket ${socket.id} joined order ${orderId}`);
      }
    });

    // New order notification
    socket.on('new-order', ({ orderId, restaurantId }) => {
      io.to(`restaurant:${restaurantId}`).emit('new-order-received', {
        orderId,
        timestamp: new Date(),
      });
      logger.info(`New order ${orderId} notified to restaurant ${restaurantId}`);
    });

    // Chat messages (future feature)
    socket.on('send-message', ({ roomId, message }) => {
      io.to(roomId).emit('receive-message', {
        message,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      // Remove from active connections
      activeConnections.forEach((sockets, userId) => {
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          activeConnections.delete(userId);
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error}`);
    });
  });

  // Helper function to emit events
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  io.emitToRestaurant = (restaurantId, event, data) => {
    io.to(`restaurant:${restaurantId}`).emit(event, data);
  };

  io.emitToOrder = (orderId, event, data) => {
    io.to(`order:${orderId}`).emit(event, data);
  };

  logger.info('Socket.IO initialized successfully');
  
  return io;
};

export default setupSocketIO;
