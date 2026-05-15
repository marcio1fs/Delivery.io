const MercadoPago = require('mercadopago');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

class MercadoPagoService {
  constructor() {
    this.mp = new MercadoPago.SDK(
      process.env.MERCADO_PAGO_ACCESS_TOKEN,
      process.env.NODE_ENV === 'production' ? 'prod' : 'sandbox'
    );
    
    this.notificationUrl = `${process.env.API_URL}/api/payments/mercadopago/notification`;
  }

  /**
   * Criar preferência de pagamento para checkout
   */
  async createPreference(orderId) {
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('user')
      .populate('items.product');

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status !== 'pending_payment') {
      throw new Error('Pedido não está aguardando pagamento');
    }

    const restaurant = order.restaurant;
    const user = order.user;

    // Calcular valores
    const items = order.items.map(item => ({
      id: item.product._id.toString(),
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.product.price),
      currency_id: 'BRL'
    }));

    // Adicionar taxa de entrega como item separado
    if (order.deliveryFee > 0) {
      items.push({
        id: 'delivery_fee',
        title: 'Taxa de Entrega',
        quantity: 1,
        unit_price: Number(order.deliveryFee),
        currency_id: 'BRL'
      });
    }

    // Adicionar desconto se houver cupom
    if (order.discount > 0) {
      items.push({
        id: 'discount',
        title: 'Desconto',
        quantity: 1,
        unit_price: -Number(order.discount),
        currency_id: 'BRL'
      });
    }

    const preference = {
      items: items,
      payer: {
        name: user.name.split(' ')[0],
        surname: user.name.split(' ').slice(1).join(' ') || '.',
        email: user.email,
        phone: {
          number: user.phone?.replace(/\D/g, '') || '',
          area_code: user.phone?.replace(/\D/g, '').substring(0, 2) || '11'
        },
        identification: {
          type: 'CPF',
          number: user.document?.replace(/\D/g, '') || ''
        },
        address: order.deliveryAddress ? {
          street_name: order.deliveryAddress.street,
          street_number: order.deliveryAddress.number,
          zip_code: order.deliveryAddress.zipCode.replace(/\D/g, ''),
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          country: 'BR'
        } : undefined
      },
      payment_methods: {
        excluded_payment_types: [
          { id: 'atm' } // Excluir pagamento em lotérica
        ],
        installments: 6 // Máximo de parcelas
      },
      shipments: {
        mode: 'custom',
        local_pickup: false,
        receiver_address: order.deliveryAddress ? {
          street_name: order.deliveryAddress.street,
          street_number: order.deliveryAddress.number,
          apartment: order.deliveryAddress.complement,
          floor: order.deliveryAddress.reference ? '1' : undefined,
          zip_code: order.deliveryAddress.zipCode.replace(/\D/g, ''),
          city_name: order.deliveryAddress.city,
          state_name: order.deliveryAddress.state,
          country_name: 'BR'
        } : undefined
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
        failure: `${process.env.FRONTEND_URL}/payment/failure?orderId=${orderId}`,
        pending: `${process.env.FRONTEND_URL}/payment/pending?orderId=${orderId}`
      },
      notification_url: this.notificationUrl,
      auto_return: 'approved',
      external_reference: orderId,
      metadata: {
        order_id: orderId,
        restaurant_id: restaurant._id.toString(),
        user_id: user._id.toString(),
        platform: 'delivery_system'
      }
    };

    const result = await this.mp.preferences.create(preference);
    
    // Atualizar pedido com ID da preferência
    await Order.findByIdAndUpdate(orderId, {
      payment: {
        ...order.payment,
        preferenceId: result.body.id,
        gateway: 'mercadopago'
      }
    });

    return {
      id: result.body.id,
      init_point: result.body.init_point, // URL para redirecionamento
      sandbox_init_point: result.body.sandbox_init_point,
      response: result.body
    };
  }

  /**
   * Processar notificação do Mercado Pago
   */
  async processNotification(paymentId, topic) {
    if (topic === 'payment') {
      const paymentInfo = await this.mp.payments.get(paymentId);
      const payment = paymentInfo.body;
      
      const orderId = payment.external_reference;
      
      if (!orderId) {
        throw new Error('Pedido não identificado na notificação');
      }

      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Pedido não encontrado');
      }

      // Mapear status do Mercado Pago para status do sistema
      const statusMap = {
        'approved': 'paid',
        'pending': 'pending_payment',
        'in_process': 'processing_payment',
        'authorized': 'authorized',
        'cancelled': 'cancelled',
        'refunded': 'refunded',
        'charged_back': 'charged_back',
        'rejected': 'failed'
      };

      const newStatus = statusMap[payment.status] || 'pending_payment';

      // Atualizar pedido
      await Order.findByIdAndUpdate(orderId, {
        status: newStatus,
        payment: {
          ...order.payment,
          paymentId: payment.id,
          status: payment.status,
          statusDetail: payment.status_detail,
          transactionAmount: payment.transaction_amount,
          paymentMethod: payment.payment_method_id,
          installment: payment.installments,
          processedAt: new Date()
        }
      });

      // Se aprovado, atualizar status do pedido para "confirmed"
      if (newStatus === 'paid') {
        await Order.findByIdAndUpdate(orderId, {
          status: 'confirmed'
        });
        
        // Notificar restaurante e entregador via WebSocket
        const io = require('../socket');
        io.to(`restaurant:${order.restaurant}`).emit('order:confirmed', { orderId });
        io.to(`user:${order.user}`).emit('order:paid', { orderId });
      }

      return {
        orderId,
        status: newStatus,
        paymentStatus: payment.status,
        amount: payment.transaction_amount
      };
    }

    return null;
  }

  /**
   * Realizar split de pagamento (Marketplace)
   * Distribui valores entre plataforma, restaurante e entregador
   */
  async createSplitPayment(orderId) {
    const order = await Order.findById(orderId)
      .populate('restaurant')
      .populate('driver');

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const totalAmount = order.totalAmount;
    const deliveryFee = order.deliveryFee || 0;
    
    // Configurar splits (valores podem ser ajustados conforme modelo de negócio)
    const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'); // 10% para plataforma
    const restaurantPercent = parseFloat(process.env.RESTAURANT_FEE_PERCENT || '85'); // 85% para restaurante
    const driverPercent = parseFloat(process.env.DRIVER_FEE_PERCENT || '5'); // 5% para entregador

    const platformFee = totalAmount * (platformFeePercent / 100);
    const restaurantAmount = (totalAmount - deliveryFee) * (restaurantPercent / 100);
    const driverAmount = deliveryFee * (driverPercent / 100) + (totalAmount - deliveryFee) * (driverPercent / 100);

    // Nota: Split real requer configuração de contas Marketplace no Mercado Pago
    // Esta é uma implementação simplificada para demonstração
    
    return {
      orderId,
      totalAmount,
      splits: {
        platform: {
          amount: platformFee,
          percent: platformFeePercent
        },
        restaurant: {
          amount: restaurantAmount,
          percent: restaurantPercent,
          recipientId: order.restaurant.mercadoPagoAccountId
        },
        driver: {
          amount: driverAmount,
          percent: driverPercent,
          recipientId: order.driver?.mercadoPagoAccountId
        }
      }
    };
  }

  /**
   * Reembolsar pagamento
   */
  async refundPayment(paymentId, amount = null) {
    const refundData = {};
    
    if (amount) {
      refundData.amount = amount; // Reembolso parcial
    }

    const result = await this.mp.refunds.create({
      payment_id: paymentId,
      ...refundData
    });

    return result.body;
  }

  /**
   * Buscar informações de um pagamento
   */
  async getPaymentInfo(paymentId) {
    const result = await this.mp.payments.get(paymentId);
    return result.body;
  }

  /**
   * Buscar pagamentos por pedido
   */
  async searchPaymentsByOrder(orderId) {
    const searchResult = await this.mp.payment.search({
      query: `external_reference:"${orderId}"`
    });

    return searchResult.body.results;
  }

  /**
   * Gerar QR Code Pix
   */
  async generatePixQRCode(orderId) {
    const order = await Order.findById(orderId)
      .populate('user');

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const preference = await this.createPreference(orderId);
    
    // Criar pagamento específico para Pix
    const paymentData = {
      transaction_amount: order.totalAmount,
      description: `Pedido #${order._id.toString().slice(-6)}`,
      payment_method_id: 'pix',
      payer: {
        email: order.user.email,
        identification: {
          type: 'CPF',
          number: order.user.document?.replace(/\D/g, '') || ''
        }
      },
      external_reference: orderId,
      notification_url: this.notificationUrl
    };

    const payment = await this.mp.payments.create(paymentData);
    
    // Atualizar pedido
    await Order.findByIdAndUpdate(orderId, {
      payment: {
        ...order.payment,
        paymentId: payment.body.id,
        gateway: 'mercadopago',
        pixQrCode: payment.body.point_of_interaction?.transaction_data?.qr_code,
        pixCopyPaste: payment.body.point_of_interaction?.transaction_data?.qr_code_base64
      }
    });

    return {
      qrCode: payment.body.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: payment.body.point_of_interaction?.transaction_data?.qr_code_base64,
      expirationDate: payment.body.point_of_interaction?.transaction_data?.ticket_expiration_time,
      paymentId: payment.body.id
    };
  }
}

module.exports = new MercadoPagoService();
