import express from 'express';
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleStatus
} from '../controllers/restaurantController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);

// Protected routes
router.use(protect);

router.post('/', restrictTo('restaurant', 'admin'), createRestaurant);
router.put('/:id', restrictTo('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', restrictTo('admin'), deleteRestaurant);
router.patch('/:id/status', restrictTo('restaurant', 'admin'), toggleStatus);

export default router;
