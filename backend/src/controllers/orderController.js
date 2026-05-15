import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';
import redisClient from '../config/redis.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
export const createOrder = asyncHandler(async (req, res) => {
  const {
    restaurant,
    items,
    deliveryAddress,
    paymentMethod,
    notes,
    scheduledTime
  } = req.body;

  // Verify restaurant exists and is open
  const restaurantDoc = await Restaurant.findById(restaurant);
  if (!restaurantDoc) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  if (!restaurantDoc.isOpen) {
    return res.status(400).json({
      success: false,
      message: 'Restaurant is currently closed',
    });
  }

  // Calculate total
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  const total = subtotal + restaurantDoc.deliveryFee;

  // Create order
  const order = await Order.create({
    customer: req.user.id,
    restaurant,
    items,
    deliveryAddress,
    paymentMethod,
    notes,
    scheduledTime,
    subtotal,
    deliveryFee: restaurantDoc.deliveryFee,
    total,
    status: 'pending'
  });

  // Populate order data
  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name phone email')
    .populate('restaurant', 'name address phone');

  logger.info(`Order created: ${order._id} by customer ${req.user.id}`);

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    const io = req.app.get('io');
    
    // Notify restaurant
    io.to(`restaurant:${restaurant}`).emit('order:new', {
      orderId: order._id,
      status: order.status
    });
    
    // Notify customer
    io.to(`user:${req.user.id}`).emit('order:created', {
      orderId: order._id,
      status: order.status
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order: populatedOrder },
  });
});

// @desc    Get all orders (filtered by role)
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, startDate, endDate } = req.query;
  
  const skip = (page - 1) * limit;
  
  let query = {};

  // Filter by role
  if (req.user.role === 'customer') {
    query.customer = req.user.id;
  } else if (req.user.role === 'restaurant') {
    const restaurants = await Restaurant.find({ owner: req.user.id }).distinct('_id');
    query.restaurant = { $in: restaurants };
  } else if (req.user.role === 'rider') {
    query.rider = req.user.id;
  }
  // Admin can see all orders

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('customer', 'name phone email')
      .populate('restaurant', 'name address phone')
      .populate('rider', 'name phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Order.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name phone email avatar')
    .populate('restaurant', 'name address phone openingHours')
    .populate('rider', 'name phone avatar');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Check authorization
  const isAuthorized = 
    order.customer._id.toString() === req.user.id ||
    order.restaurant.owner.toString() === req.user.id ||
    (order.rider && order.rider._id.toString() === req.user.id) ||
    req.user.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order',
    });
  }

  res.json({
    success: true,
    data: { order },
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, riderId, cancellationReason } = req.body;

  const order = await Order.findById(req.params.id)
    .populate('restaurant')
    .populate('customer');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Check authorization based on status change
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['picked_up', 'cancelled'],
    picked_up: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!allowedTransitions[order.status].includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot transition from ${order.status} to ${status}`,
    });
  }

  // Authorization checks
  if (status === 'confirmed' || status === 'cancelled') {
    if (order.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only restaurant can confirm or cancel orders',
      });
    }
  }

  if (status === 'picked_up' || status === 'delivered') {
    if (order.rider && order.rider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only assigned rider can update delivery status',
      });
    }
  }

  // Update order
  order.status = status;
  
  if (status === 'cancelled' && cancellationReason) {
    order.cancellationReason = cancellationReason;
  }
  
  if (riderId && status === 'picked_up') {
    order.rider = riderId;
  }

  // Add status history
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.user.id
  });

  await order.save();

  logger.info(`Order ${order._id} status updated to ${status}`);

  // Emit socket events
  if (req.app.get('io')) {
    const io = req.app.get('io');
    
    // Notify customer
    io.to(`user:${order.customer._id}`).emit('order:status', {
      orderId: order._id,
      status: order.status,
      updatedAt: new Date()
    });
    
    // Notify restaurant
    io.to(`restaurant:${order.restaurant._id}`).emit('order:status', {
      orderId: order._id,
      status: order.status,
      updatedAt: new Date()
    });
    
    // Notify rider if assigned
    if (order.rider) {
      io.to(`user:${order.rider}`).emit('order:status', {
        orderId: order._id,
        status: order.status,
        updatedAt: new Date()
      });
    }
  }

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name phone')
    .populate('restaurant', 'name phone')
    .populate('rider', 'name phone');

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: { order: updatedOrder },
  });
});

// @desc    Assign rider to order
// @route   PATCH /api/orders/:id/assign-rider
// @access  Private/Admin or Restaurant
export const assignRider = asyncHandler(async (req, res) => {
  const { riderId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot assign rider to order in current status',
    });
  }

  // Verify rider exists and is active
  const rider = await User.findOne({ _id: riderId, role: 'rider', isActive: true });
  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found or inactive',
    });
  }

  order.rider = riderId;
  await order.save();

  logger.info(`Rider ${riderId} assigned to order ${order._id}`);

  // Emit socket event
  if (req.app.get('io')) {
    req.app.get('io').to(`user:${riderId}`).emit('order:assigned', {
      orderId: order._id
    });
  }

  const updatedOrder = await Order.findById(order._id)
    .populate('rider', 'name phone');

  res.json({
    success: true,
    message: 'Rider assigned successfully',
    data: { order: updatedOrder },
  });
});

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed', 'preparing'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: 'Order cannot be cancelled in current status',
    });
  }

  // Check authorization
  const isCustomer = order.customer.toString() === req.user.id;
  const isRestaurantOwner = await Restaurant.exists({ 
    _id: order.restaurant, 
    owner: req.user.id 
  });

  if (!isCustomer && !isRestaurantOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order',
    });
  }

  order.status = 'cancelled';
  order.cancellationReason = reason || 'No reason provided';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.user.id
  });

  await order.save();

  logger.info(`Order ${order._id} cancelled by ${req.user.id}`);

  // Emit socket events
  if (req.app.get('io')) {
    const io = req.app.get('io');
    
    io.to(`user:${order.customer}`).emit('order:cancelled', {
      orderId: order._id,
      reason: order.cancellationReason
    });
    
    const restaurant = await Restaurant.findById(order.restaurant);
    io.to(`restaurant:${order.restaurant}`).emit('order:cancelled', {
      orderId: order._id
    });
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/statistics
// @access  Private/Admin or Restaurant
export const getOrderStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let query = {};
  
  if (req.user.role === 'restaurant') {
    const restaurants = await Restaurant.find({ owner: req.user.id }).distinct('_id');
    query.restaurant = { $in: restaurants };
  } else if (req.user.role === 'customer') {
    query.customer = req.user.id;
  } else if (req.user.role === 'rider') {
    query.rider = req.user.id;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const statistics = await Order.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);

  const totalOrders = await Order.countDocuments(query);
  const totalRevenue = statistics.reduce((sum, stat) => sum + stat.totalRevenue, 0);

  res.json({
    success: true,
    data: {
      statistics,
      totalOrders,
      totalRevenue,
      period: { startDate, endDate }
    },
  });
});
