import express from 'express';
import {
  uploadImage,
  uploadMultipleImages,
  uploadRestaurantImage,
  uploadProductImage,
  uploadAvatar,
  uploadGallery,
} from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Upload único de imagem (genérico)
router.post('/image', protect, uploadRestaurantImage, uploadImage);

// Upload múltiplo de imagens
router.post('/images', protect, uploadGallery, uploadMultipleImages);

// Upload específico para restaurantes
router.post('/restaurant', protect, uploadRestaurantImage, uploadImage);

// Upload específico para produtos
router.post('/product', protect, uploadProductImage, uploadImage);

// Upload de avatar
router.post('/avatar', protect, uploadAvatar, uploadImage);

export default router;
