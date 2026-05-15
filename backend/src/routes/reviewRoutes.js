import express from 'express';
import Review from '../models/Review.js';
import { protect } from '../middleware/auth.js';
import { reviewValidator } from '../validators/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Criar review (apenas usuários que fizeram pedido no restaurante)
router.post('/', protect, reviewValidator, async (req, res, next) => {
  try {
    const { restaurantId, orderId, rating, comment, images } = req.body;

    // Verificar se usuário já fez pedido neste restaurante
    const Order = mongoose.model('Order');
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      restaurant: restaurantId,
      status: 'delivered',
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: 'Você só pode avaliar pedidos que foram entregues',
      });
    }

    // Verificar se já existe review para este pedido
    const existingReview = await Review.findOne({
      order: orderId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este pedido',
      });
    }

    const review = await Review.create({
      user: req.user._id,
      restaurant: restaurantId,
      order: orderId,
      rating,
      comment,
      images,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name image');

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
});

// Buscar reviews de um restaurante
router.get('/restaurant/:restaurantId', async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { restaurant: restaurantId };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ [sortBy]: order })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Buscar minhas reviews
router.get('/my-reviews', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Atualizar review (apenas dono da review)
router.put('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review não encontrada',
      });
    }

    // Verificar se é o dono da review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado',
      });
    }

    const { rating, comment, images } = req.body;

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name image');

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
});

// Deletar review (apenas dono ou admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review não encontrada',
      });
    }

    // Verificar permissão
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado',
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review removida com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// Marcar review como útil
router.post('/:id/helpful', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review não encontrada',
      });
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      data: { helpful: review.helpful },
    });
  } catch (error) {
    next(error);
  }
});

// Restaurante responde à review
router.post('/:id/response', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id).populate('restaurant');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review não encontrada',
      });
    }

    // Verificar se é do restaurante
    if (review.restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o restaurante pode responder',
      });
    }

    const { text } = req.body;

    review.response = {
      text,
      date: new Date(),
      by: req.user._id,
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name image');

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
