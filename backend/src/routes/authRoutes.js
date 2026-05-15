import express from 'express';
import { register, login, refreshToken, getMe, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validator.js';
import { registerValidator, loginValidator, updateUserValidator } from '../validators/index.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', authLimiter, refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserValidator, validate, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
