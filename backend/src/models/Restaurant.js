import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  address: {
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
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  category: [{
    type: String,
    enum: ['restaurant', 'bar', 'cafe', 'bakery', 'market', 'pharmacy', 'other'],
  }],
  cuisines: [String],
  image: {
    type: String,
    default: '',
  },
  gallery: [String],
  openingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean },
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  deliveryTime: {
    min: Number,
    max: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'pix'],
  }],
}, {
  timestamps: true,
});

// Index for geospatial queries
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
restaurantSchema.index({ name: 'text', description: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
