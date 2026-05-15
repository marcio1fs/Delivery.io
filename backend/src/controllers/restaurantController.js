import Restaurant from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import redisClient from '../config/redis.js';

// @desc    Get all restaurants with filters
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    cuisine, 
    rating, 
    deliveryTime, 
    search,
    isOpen 
  } = req.query;

  const skip = (page - 1) * limit;
  
  // Build query
  let query = { isActive: true };
  
  if (cuisine) {
    query.cuisine = cuisine;
  }
  
  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) };
  }
  
  if (deliveryTime) {
    query.deliveryTime.max = { $lte: parseInt(deliveryTime) };
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isOpen !== undefined) {
    query.isOpen = isOpen === 'true';
  }

  // Try to get from cache
  const cacheKey = `restaurants:${JSON.stringify(query)}:${page}:${limit}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (error) {
    logger.warn('Redis cache error:', error);
  }

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .populate('owner', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 })
      .lean(),
    Restaurant.countDocuments(query)
  ]);

  const response = {
    success: true,
    data: {
      restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  };

  // Cache for 5 minutes
  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
  } catch (error) {
    logger.warn('Redis cache set error:', error);
  }

  res.json(response);
});

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
    .populate('owner', 'name email phone avatar')
    .populate('products');

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  res.json({
    success: true,
    data: { restaurant },
  });
});

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Restaurant
export const createRestaurant = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    address,
    cuisine,
    deliveryTime,
    minimumOrder,
    deliveryFee,
    openingHours,
    images
  } = req.body;

  const restaurant = await Restaurant.create({
    name,
    description,
    address,
    cuisine,
    deliveryTime,
    minimumOrder,
    deliveryFee,
    openingHours,
    images,
    owner: req.user.id
  });

  logger.info(`Restaurant created: ${restaurant.name} by user ${req.user.id}`);

  res.status(201).json({
    success: true,
    message: 'Restaurant created successfully',
    data: { restaurant },
  });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Restaurant
export const updateRestaurant = asyncHandler(async (req, res) => {
  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  // Check ownership or admin
  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this restaurant',
    });
  }

  restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Invalidate cache
  try {
    const keys = await redisClient.keys('restaurants:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Redis cache invalidation error:', error);
  }

  logger.info(`Restaurant updated: ${restaurant._id}`);

  res.json({
    success: true,
    message: 'Restaurant updated successfully',
    data: { restaurant },
  });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
export const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this restaurant',
    });
  }

  await restaurant.deleteOne();

  // Invalidate cache
  try {
    const keys = await redisClient.keys('restaurants:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    logger.warn('Redis cache invalidation error:', error);
  }

  logger.info(`Restaurant deleted: ${req.params.id}`);

  res.json({
    success: true,
    message: 'Restaurant deleted successfully',
  });
});

// @desc    Toggle restaurant status
// @route   PATCH /api/restaurants/:id/status
// @access  Private/Restaurant
export const toggleStatus = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  restaurant.isOpen = !restaurant.isOpen;
  await restaurant.save();

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    req.app.get('io').to(`restaurant:${restaurant._id}`).emit('restaurant:status', {
      restaurantId: restaurant._id,
      isOpen: restaurant.isOpen
    });
  }

  res.json({
    success: true,
    message: `Restaurant is now ${restaurant.isOpen ? 'open' : 'closed'}`,
    data: { isOpen: restaurant.isOpen },
  });
});
