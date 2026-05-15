import express from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  assignRider,
  cancelOrder,
  getOrderStatistics
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All order routes are protected
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my', getOrders); // Get orders for current user based on role
router.get('/statistics', getOrderStatistics);

// General routes (access controlled inside controller)
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/assign-rider', restrictTo('admin', 'restaurant'), assignRider);
router.delete('/:id', cancelOrder);

export default router;
