import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    observations: String,
    addons: [{
      name: String,
      price: Number,
    }],
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryAddress: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    reference: String,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'pix'],
    required: true,
  },
  paymentInfo: {
    cardNumber: String,
    installments: Number,
    changeFor: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'on_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  notes: String,
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
  },
}, {
  timestamps: true,
});

// Index for querying orders
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ rider: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Update status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
