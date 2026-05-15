import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
      },
    ],
    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    firstTimeUserOnly: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validUntil: 1 });

// Validar cupom
couponSchema.statics.validateCoupon = async function (code, userId, orderValue, restaurantId) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
  }).populate('applicableRestaurants applicableUsers');

  if (!coupon) {
    return { valid: false, error: 'Cupom inválido' };
  }

  // Verificar validade
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, error: 'Cupom fora do período de validade' };
  }

  // Verificar limite de uso
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Cupom esgotado' };
  }

  // Verificar valor mínimo
  if (orderValue < coupon.minOrderValue) {
    return {
      valid: false,
      error: `Valor mínimo do pedido: R$ ${coupon.minOrderValue.toFixed(2)}`,
    };
  }

  // Verificar usuário específico
  if (coupon.applicableUsers.length > 0) {
    const isApplicable = coupon.applicableUsers.some(
      (user) => user._id.toString() === userId.toString()
    );
    if (!isApplicable) {
      return { valid: false, error: 'Cupom não aplicável para este usuário' };
    }
  }

  // Verificar restaurante
  if (coupon.applicableRestaurants.length > 0 && restaurantId) {
    const isApplicable = coupon.applicableRestaurants.some(
      (restaurant) => restaurant._id.toString() === restaurantId.toString()
    );
    if (!isApplicable) {
      return { valid: false, error: 'Cupom não aplicável para este restaurante' };
    }
  }

  // Verificar limite por usuário
  const Usage = mongoose.model('CouponUsage');
  const userUsage = await Usage.countDocuments({
    coupon: coupon._id,
    user: userId,
  });

  if (userUsage >= coupon.userUsageLimit) {
    return { valid: false, error: 'Limite de uso deste cupom atingido' };
  }

  // Calcular desconto
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return {
    valid: true,
    coupon,
    discount,
  };
};

// Modelo de uso de cupom
const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponUsageSchema.index({ coupon: 1, user: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
const CouponUsage = mongoose.model('CouponUsage', couponUsageSchema);

export { Coupon, CouponUsage };
export default Coupon;
