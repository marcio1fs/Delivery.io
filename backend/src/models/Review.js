import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [String],
    helpful: {
      type: Number,
      default: 0,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: true,
    },
    response: {
      text: String,
      date: Date,
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Índices
reviewSchema.index({ restaurant: 1, rating: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

// Middleware para calcular média de ratings no restaurante
reviewSchema.statics.calculateAverageRating = async function (restaurantId) {
  const stats = await this.aggregate([
    {
      $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) },
    },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return stats.length > 0
    ? {
        average: stats[0].averageRating.toFixed(2),
        count: stats[0].totalReviews,
      }
    : { average: 0, count: 0 };
};

// Hook pós-salvar para atualizar rating do restaurante
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const stats = await Review.calculateAverageRating(this.restaurant);

  const Restaurant = mongoose.model('Restaurant');
  await Restaurant.findByIdAndUpdate(this.restaurant, {
    rating: stats.average,
    totalReviews: stats.count,
  });
});

// Hook pós-remover para atualizar rating do restaurante
reviewSchema.post('remove', async function () {
  const Review = this.constructor;
  const stats = await Review.calculateAverageRating(this.restaurant);

  const Restaurant = mongoose.model('Restaurant');
  await Restaurant.findByIdAndUpdate(this.restaurant, {
    rating: stats.average,
    totalReviews: stats.count,
  });
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
