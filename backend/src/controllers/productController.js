import Product from '../models/Product.js';
import Restaurant from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import redisClient from '../config/redis.js';

// @desc    Get all products for a restaurant
// @route   GET /api/products/restaurant/:restaurantId
// @access  Public
export const getProductsByRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const { category, available, page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;
  
  let query = { restaurant: restaurantId };
  
  if (category) {
    query.category = category;
  }
  
  if (available !== undefined) {
    query.isAvailable = available === 'true';
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('restaurant', 'name address');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.json({
    success: true,
    data: { product },
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Restaurant
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    images,
    isAvailable,
    preparationTime,
    ingredients,
    allergens
  } = req.body;

  // Verify restaurant ownership
  const restaurant = await Restaurant.findOne({ 
    _id: req.body.restaurant,
    owner: req.user.id 
  });

  if (!restaurant && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add products to this restaurant',
    });
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    images,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    preparationTime,
    ingredients,
    allergens,
    restaurant: req.body.restaurant || restaurant._id
  });

  // Update restaurant products array
  await Restaurant.findByIdAndUpdate(
    req.body.restaurant || restaurant._id,
    { $push: { products: product._id } }
  );

  logger.info(`Product created: ${product.name} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Restaurant
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check ownership
  const restaurant = await Restaurant.findOne({
    _id: product.restaurant,
    owner: req.user.id
  });

  if (!restaurant && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this product',
    });
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Invalidate cache
  try {
    const keys = await redisClient.keys(`products:${product.restaurant}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Redis cache invalidation error:', error);
  }

  logger.info(`Product updated: ${product._id}`);

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Restaurant/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check ownership
  const restaurant = await Restaurant.findOne({
    _id: product.restaurant,
    owner: req.user.id
  });

  if (!restaurant && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this product',
    });
  }

  await product.deleteOne();

  // Remove from restaurant products array
  await Restaurant.findByIdAndUpdate(
    product.restaurant,
    { $pull: { products: product._id } }
  );

  // Invalidate cache
  try {
    const keys = await redisClient.keys(`products:${product.restaurant}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Redis cache invalidation error:', error);
  }

  logger.info(`Product deleted: ${req.params.id}`);

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// @desc    Toggle product availability
// @route   PATCH /api/products/:id/availability
// @access  Private/Restaurant
export const toggleAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check ownership
  const restaurant = await Restaurant.findOne({
    _id: product.restaurant,
    owner: req.user.id
  });

  if (!restaurant && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  product.isAvailable = !product.isAvailable;
  await product.save();

  // Emit socket event
  if (req.app.get('io')) {
    req.app.get('io').to(`restaurant:${product.restaurant}`).emit('product:availability', {
      productId: product._id,
      isAvailable: product.isAvailable
    });
  }

  res.json({
    success: true,
    message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
    data: { isAvailable: product.isAvailable },
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;
  
  let query = { isAvailable: true };
  
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { ingredients: { $regex: q, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.category = category;
  }
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('restaurant', 'name address deliveryTime rating')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    },
  });
});
