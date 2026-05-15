import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Buscar todas as notificações do usuário
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user._id };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
});

// Marcar notificação como lida
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada',
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notificação marcada como lida',
    });
  } catch (error) {
    next(error);
  }
});

// Marcar todas as notificações como lidas
router.post('/mark-all-read', protect, async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Todas as notificações marcadas como lidas',
    });
  } catch (error) {
    next(error);
  }
});

// Deletar notificação
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificação não encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notificação removida',
    });
  } catch (error) {
    next(error);
  }
});

// Criar notificação (apenas admin ou sistema)
router.post('/', protect, async (req, res, next) => {
  try {
    // Apenas admins podem criar notificações manualmente
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado',
      });
    }

    const { userId, type, title, message, data, priority, actionUrl } = req.body;

    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
      actionUrl,
    });

    // Emitir via WebSocket se estiver conectado
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('notification', notification);
    }

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
});

// Obter contagem de não lidas
router.get('/unread/count', protect, async (req, res, next) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
