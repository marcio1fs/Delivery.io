import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'pix', 'paypal', 'stripe'],
      required: true,
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountHolder: String,
      pixKey: String,
    },
    period: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    orders: [
      {
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        amount: Number,
        commission: Number,
        netAmount: Number,
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
      description: 'Valor total da comissão da plataforma',
    },
    netAmount: {
      type: Number,
      required: true,
      description: 'Valor líquido (amount - commission)',
    },
    transactionId: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

// Índices
payoutSchema.index({ restaurant: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ period: 1 });

// Calcular payout para um restaurante em um período
payoutSchema.statics.calculatePayout = async function (restaurantId, startDate, endDate, commissionRate = 0.1) {
  const Order = mongoose.model('Order');

  const orders = await Order.find({
    restaurant: restaurantId,
    status: 'delivered',
    deliveredAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  let totalAmount = 0;
  let totalCommission = 0;
  const orderDetails = [];

  for (const order of orders) {
    const commission = order.total * commissionRate;
    const netAmount = order.total - commission;

    totalAmount += order.total;
    totalCommission += commission;

    orderDetails.push({
      order: order._id,
      amount: order.total,
      commission,
      netAmount,
    });
  }

  return {
    totalAmount,
    totalCommission,
    netAmount: totalAmount - totalCommission,
    totalOrders: orders.length,
    orders: orderDetails,
  };
};

// Método para processar payout
payoutSchema.methods.process = async function () {
  if (this.status !== 'pending') {
    throw new Error('Payout não está pendente');
  }

  this.status = 'processing';
  await this.save();

  // Simular processamento de pagamento
  // Em produção, integrar com gateway de pagamento (Stripe, PayPal, etc.)
  try {
    // Aqui iria a integração com API de pagamento
    // Ex: stripe.transfers.create({...})

    this.status = 'completed';
    this.processedAt = new Date();
    this.transactionId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.save();

    // Atualizar pedidos como pagos
    const Order = mongoose.model('Order');
    for (const orderDetail of this.orders) {
      await Order.findByIdAndUpdate(orderDetail.order, {
        paymentStatus: 'paid_to_restaurant',
      });
    }

    return this;
  } catch (error) {
    this.status = 'failed';
    this.failureReason = error.message;
    await this.save();
    throw error;
  }
};

// Método para cancelar payout
payoutSchema.methods.cancel = async function (reason) {
  if (this.status === 'completed') {
    throw new Error('Não é possível cancelar um payout completado');
  }

  this.status = 'cancelled';
  this.failureReason = reason;
  await this.save();

  return this;
};

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
