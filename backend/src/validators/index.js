import { body, param, query } from 'express-validator';

export const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['customer', 'restaurant', 'rider'])
    .withMessage('Invalid role'),
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const updateUserValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
];

export const createRestaurantValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required'),
  body('category')
    .isArray()
    .withMessage('Category must be an array'),
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),
  body('minimumOrder')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order must be a positive number'),
];

export const createProductValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('restaurant')
    .optional()
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
];

export const createOrderValidator = [
  body('restaurant')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('paymentMethod')
    .isIn(['cash', 'card', 'pix'])
    .withMessage('Invalid payment method'),
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street is required'),
  body('deliveryAddress.number')
    .trim()
    .notEmpty()
    .withMessage('Number is required'),
  body('deliveryAddress.neighborhood')
    .trim()
    .notEmpty()
    .withMessage('Neighborhood is required'),
  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
];

export const updateOrderStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const restaurantIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid restaurant ID'),
];

export const productIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

export const orderIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
];
