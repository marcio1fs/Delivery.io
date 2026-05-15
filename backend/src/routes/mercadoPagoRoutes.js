const express = require('express');
const router = express.Router();
const mercadoPagoService = require('../services/mercadoPagoService');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/payments/mercadopago/create-preference
 * @desc    Criar preferência de pagamento
 * @access  Private
 */
router.post('/create-preference', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pedido é obrigatório' 
      });
    }

    const preference = await mercadoPagoService.createPreference(orderId);

    res.json({
      success: true,
      data: preference
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao criar preferência de pagamento' 
    });
  }
});

/**
 * @route   POST /api/payments/mercadopago/generate-pix
 * @desc    Gerar QR Code Pix para pagamento
 * @access  Private
 */
router.post('/generate-pix', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pedido é obrigatório' 
      });
    }

    const pixData = await mercadoPagoService.generatePixQRCode(orderId);

    res.json({
      success: true,
      data: pixData
    });
  } catch (error) {
    console.error('Erro ao gerar Pix:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao gerar QR Code Pix' 
    });
  }
});

/**
 * @route   POST /api/payments/mercadopago/notification
 * @desc    Webhook para notificações do Mercado Pago
 * @access  Public (requer validação de signature em produção)
 */
router.post('/notification', async (req, res) => {
  try {
    const { id, topic, action } = req.query;
    const { data } = req.body;

    let paymentId = id || data?.id;
    let notificationTopic = topic || action;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pagamento não fornecido' 
      });
    }

    // Processar notificação
    const result = await mercadoPagoService.processNotification(paymentId, notificationTopic);

    res.json({
      success: true,
      message: 'Notificação processada com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro ao processar notificação:', error);
    // Retornar 200 mesmo em erro para evitar retries desnecessários do MP
    res.status(200).json({ 
      success: false, 
      message: error.message || 'Erro ao processar notificação' 
    });
  }
});

/**
 * @route   GET /api/payments/mercadopago/payment/:paymentId
 * @desc    Buscar informações de um pagamento
 * @access  Private
 */
router.get('/payment/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentInfo = await mercadoPagoService.getPaymentInfo(paymentId);

    res.json({
      success: true,
      data: paymentInfo
    });
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao buscar informações do pagamento' 
    });
  }
});

/**
 * @route   GET /api/payments/mercadopago/order/:orderId
 * @desc    Buscar pagamentos por pedido
 * @access  Private
 */
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await mercadoPagoService.searchPaymentsByOrder(orderId);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao buscar pagamentos do pedido' 
    });
  }
});

/**
 * @route   POST /api/payments/mercadopago/refund
 * @desc    Reembolsar pagamento
 * @access  Private (Admin)
 */
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID do pagamento é obrigatório' 
      });
    }

    const refund = await mercadoPagoService.refundPayment(paymentId, amount);

    res.json({
      success: true,
      data: refund,
      message: amount ? 'Reembolso parcial realizado' : 'Reembolso total realizado'
    });
  } catch (error) {
    console.error('Erro ao reembolsar:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao processar reembolso' 
    });
  }
});

/**
 * @route   GET /api/payments/mercadopago/split/:orderId
 * @desc    Calcular split de pagamento para marketplace
 * @access  Private (Admin)
 */
router.get('/split/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const splitData = await mercadoPagoService.createSplitPayment(orderId);

    res.json({
      success: true,
      data: splitData
    });
  } catch (error) {
    console.error('Erro ao calcular split:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erro ao calcular split de pagamento' 
    });
  }
});

module.exports = router;
