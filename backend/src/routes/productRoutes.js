import express from 'express';
import {
  getProductsByRestaurant,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  searchProducts
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getProductsByRestaurant);
router.get('/:id', getProduct);
router.get('/search', searchProducts);

// Protected routes
router.use(protect);

router.post('/', restrictTo('restaurant', 'admin'), createProduct);
router.put('/:id', restrictTo('restaurant', 'admin'), updateProduct);
router.delete('/:id', restrictTo('restaurant', 'admin'), deleteProduct);
router.patch('/:id/availability', restrictTo('restaurant', 'admin'), toggleAvailability);

export default router;
