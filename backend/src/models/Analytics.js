import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalUsers: {
        type: Number,
        default: 0,
      },
      activeUsers: {
        type: Number,
        default: 0,
      },
      newUsers: {
        type: Number,
        default: 0,
      },
      totalRestaurants: {
        type: Number,
        default: 0,
      },
      activeRestaurants: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
      averageDeliveryTime: {
        type: Number,
        default: 0, // em minutos
      },
      cancellationRate: {
        type: Number,
        default: 0, // porcentagem
      },
      topRestaurants: [
        {
          restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
          },
          orders: Number,
          revenue: Number,
        },
      ],
      topProducts: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
          },
          quantity: Number,
          revenue: Number,
        },
      ],
      ordersByStatus: {
        pending: Number,
        confirmed: Number,
        preparing: Number,
        ready: Number,
        onTheWay: Number,
        delivered: Number,
        cancelled: Number,
      },
      ordersByHour: [
        {
          hour: Number,
          count: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Índice único para evitar duplicação
analyticsSchema.index({ date: 1, type: 1 }, { unique: true });

// Método estático para agregar métricas diárias
analyticsSchema.statics.aggregateDailyMetrics = async function (date) {
  const Order = mongoose.model('Order');
  const User = mongoose.model('User');
  const Restaurant = mongoose.model('Restaurant');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Agregar pedidos
  const orderStats = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
  ]);

  // Total de pedidos e receita
  const totalOrders = orderStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalRevenue = orderStats.reduce((sum, stat) => sum + stat.revenue, 0);

  // Novos usuários
  const newUsers = await User.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  // Usuários ativos (fizeram pedido hoje)
  const activeUsers = await Order.distinct('user', {
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  // Pedidos por hora
  const ordersByHour = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Top restaurantes
  const topRestaurants = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: '$restaurant',
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
    {
      $sort: { orders: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  // Taxa de cancelamento
  const cancelledOrders = orderStats.find((stat) => stat._id === 'cancelled')?.count || 0;
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  // Tempo médio de entrega
  const deliveredOrders = await Order.find({
    status: 'delivered',
    deliveredAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  });

  let averageDeliveryTime = 0;
  if (deliveredOrders.length > 0) {
    const deliveryTimes = deliveredOrders.map((order) => {
      const createdAt = order.createdAt.getTime();
      const deliveredAt = order.deliveredAt.getTime();
      return (deliveredAt - createdAt) / 1000 / 60; // minutos
    });
    averageDeliveryTime = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
  }

  return {
    totalOrders,
    totalRevenue,
    newUsers,
    activeUsers: activeUsers.length,
    cancellationRate: parseFloat(cancellationRate.toFixed(2)),
    averageDeliveryTime: parseFloat(averageDeliveryTime.toFixed(2)),
    ordersByStatus: {
      pending: orderStats.find((s) => s._id === 'pending')?.count || 0,
      confirmed: orderStats.find((s) => s._id === 'confirmed')?.count || 0,
      preparing: orderStats.find((s) => s._id === 'preparing')?.count || 0,
      ready: orderStats.find((s) => s._id === 'ready')?.count || 0,
      onTheWay: orderStats.find((s) => s._id === 'on_the_way')?.count || 0,
      delivered: orderStats.find((s) => s._id === 'delivered')?.count || 0,
      cancelled: cancelledOrders,
    },
    ordersByHour: ordersByHour.map((h) => ({ hour: h._id, count: h.count })),
    topRestaurants,
  };
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
