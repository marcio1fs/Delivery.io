const mercadoPagoService = require('../services/mercadoPagoService');
const Order = require('../models/Order');

describe('MercadoPagoService', () => {
  // Mock do modelo Order
  jest.mock('../models/Order');
  
  // Mock do SDK do Mercado Pago
  const mockCreatePreference = jest.fn();
  const mockGetPayment = jest.fn();
  const mockCreatePayment = jest.fn();
  const mockCreateRefund = jest.fn();
  const mockSearchPayment = jest.fn();

  beforeAll(() => {
    jest.mock('mercadopago', () => ({
      SDK: jest.fn().mockImplementation(() => ({
        preferences: {
          create: mockCreatePreference
        },
        payments: {
          get: mockGetPayment,
          create: mockCreatePayment
        },
        refunds: {
          create: mockCreateRefund
        },
        payment: {
          search: mockSearchPayment
        }
      }))
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MERCADO_PAGO_ACCESS_TOKEN = 'TEST-token';
    process.env.API_URL = 'http://localhost:3000';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.PLATFORM_FEE_PERCENT = '10';
    process.env.RESTAURANT_FEE_PERCENT = '85';
    process.env.DRIVER_FEE_PERCENT = '5';
  });

  describe('createPreference', () => {
    it('deve criar preferência de pagamento com sucesso', async () => {
      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        status: 'pending_payment',
        totalAmount: 100.50,
        deliveryFee: 10.00,
        discount: 0,
        items: [
          {
            product: {
              _id: 'prod1',
              name: 'Hambúrguer',
              price: 45.25
            },
            quantity: 2
          }
        ],
        restaurant: { _id: 'rest1' },
        user: {
          _id: 'user1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          document: '123.456.789-00'
        },
        deliveryAddress: {
          street: 'Rua Teste',
          number: '123',
          zipCode: '01234-567',
          city: 'São Paulo',
          state: 'SP'
        }
      };

      Order.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder)
      });

      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      mockCreatePreference.mockResolvedValue({
        body: {
          id: 'pref123',
          init_point: 'https://mp.com.br/checkout/pref123',
          sandbox_init_point: 'https://sandbox.mp.com.br/checkout/pref123'
        }
      });

      const result = await mercadoPagoService.createPreference('60d5ecb5c9e77c001f5e7c8a');

      expect(result).toHaveProperty('id', 'pref123');
      expect(result).toHaveProperty('init_point');
      expect(mockCreatePreference).toHaveBeenCalled();
    });

    it('deve lançar erro se pedido não existir', async () => {
      Order.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(
        mercadoPagoService.createPreference('invalid-id')
      ).rejects.toThrow('Pedido não encontrado');
    });

    it('deve lançar erro se pedido não estiver em pending_payment', async () => {
      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        status: 'confirmed'
      };

      Order.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder)
      });

      await expect(
        mercadoPagoService.createPreference('60d5ecb5c9e77c001f5e7c8a')
      ).rejects.toThrow('Pedido não está aguardando pagamento');
    });
  });

  describe('processNotification', () => {
    it('deve processar notificação de pagamento aprovado', async () => {
      const mockPayment = {
        id: 'pay123',
        external_reference: '60d5ecb5c9e77c001f5e7c8a',
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: 100.50,
        payment_method_id: 'visa',
        installments: 1
      };

      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        restaurant: 'rest1',
        user: 'user1',
        payment: {}
      };

      mockGetPayment.mockResolvedValue({ body: mockPayment });
      Order.findById.mockResolvedValue(mockOrder);
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      const result = await mercadoPagoService.processNotification('pay123', 'payment');

      expect(result).toEqual({
        orderId: '60d5ecb5c9e77c001f5e7c8a',
        status: 'paid',
        paymentStatus: 'approved',
        amount: 100.50
      });

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        '60d5ecb5c9e77c001f5e7c8a',
        expect.objectContaining({
          status: 'paid',
          payment: expect.any(Object)
        })
      );
    });

    it('deve processar notificação de pagamento rejeitado', async () => {
      const mockPayment = {
        id: 'pay123',
        external_reference: '60d5ecb5c9e77c001f5e7c8a',
        status: 'rejected',
        status_detail: 'cc_rejected_bad_filled_card_number',
        transaction_amount: 100.50
      };

      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        restaurant: 'rest1',
        user: 'user1',
        payment: {}
      };

      mockGetPayment.mockResolvedValue({ body: mockPayment });
      Order.findById.mockResolvedValue(mockOrder);
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      const result = await mercadoPagoService.processNotification('pay123', 'payment');

      expect(result.status).toBe('failed');
    });

    it('deve ignorar notificação sem topic payment', async () => {
      const result = await mercadoPagoService.processNotification('123', 'merchant_order');
      expect(result).toBeNull();
    });
  });

  describe('generatePixQRCode', () => {
    it('deve gerar QR Code Pix com sucesso', async () => {
      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        totalAmount: 50.00,
        user: {
          email: 'joao@email.com',
          document: '123.456.789-00'
        }
      };

      Order.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder)
      });

      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      mockCreatePreference.mockResolvedValue({ body: { id: 'pref123' } });

      mockCreatePayment.mockResolvedValue({
        body: {
          id: 'pay123',
          point_of_interaction: {
            transaction_data: {
              qr_code: '00020126580014BR.GOV.BCB.PIX...',
              qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
              ticket_expiration_time: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      });

      const result = await mercadoPagoService.generatePixQRCode('60d5ecb5c9e77c001f5e7c8a');

      expect(result).toHaveProperty('qrCode');
      expect(result).toHaveProperty('qrCodeBase64');
      expect(result).toHaveProperty('expirationDate');
      expect(result).toHaveProperty('paymentId', 'pay123');
    });
  });

  describe('refundPayment', () => {
    it('deve realizar reembolso total', async () => {
      mockCreateRefund.mockResolvedValue({
        body: {
          id: 'refund123',
          payment_id: 'pay123',
          amount: 100.50,
          status: 'approved'
        }
      });

      const result = await mercadoPagoService.refundPayment('pay123');

      expect(result).toHaveProperty('id', 'refund123');
      expect(result.status).toBe('approved');
    });

    it('deve realizar reembolso parcial', async () => {
      mockCreateRefund.mockResolvedValue({
        body: {
          id: 'refund123',
          payment_id: 'pay123',
          amount: 50.00,
          status: 'approved'
        }
      });

      const result = await mercadoPagoService.refundPayment('pay123', 50.00);

      expect(result.amount).toBe(50.00);
    });
  });

  describe('createSplitPayment', () => {
    it('deve calcular split de pagamento corretamente', async () => {
      const mockOrder = {
        _id: '60d5ecb5c9e77c001f5e7c8a',
        totalAmount: 100.00,
        deliveryFee: 10.00,
        restaurant: {
          _id: 'rest1',
          mercadoPagoAccountId: 'mp_rest1'
        },
        driver: {
          mercadoPagoAccountId: 'mp_driver1'
        }
      };

      Order.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrder)
      });

      const result = await mercadoPagoService.createSplitPayment('60d5ecb5c9e77c001f5e7c8a');

      expect(result.totalAmount).toBe(100.00);
      expect(result.splits.platform.percent).toBe(10);
      expect(result.splits.restaurant.percent).toBe(85);
      expect(result.splits.driver.percent).toBe(5);
      expect(result.splits.restaurant.recipientId).toBe('mp_rest1');
      expect(result.splits.driver.recipientId).toBe('mp_driver1');
    });
  });

  describe('getPaymentInfo', () => {
    it('deve buscar informações do pagamento', async () => {
      const mockPayment = {
        id: 'pay123',
        status: 'approved',
        transaction_amount: 100.50
      };

      mockGetPayment.mockResolvedValue({ body: mockPayment });

      const result = await mercadoPagoService.getPaymentInfo('pay123');

      expect(result).toEqual(mockPayment);
    });
  });

  describe('searchPaymentsByOrder', () => {
    it('deve buscar pagamentos por pedido', async () => {
      const mockPayments = [
        { id: 'pay1', status: 'approved' },
        { id: 'pay2', status: 'pending' }
      ];

      mockSearchPayment.mockResolvedValue({
        body: { results: mockPayments }
      });

      const result = await mercadoPagoService.searchPaymentsByOrder('order123');

      expect(result).toEqual(mockPayments);
      expect(mockSearchPayment).toHaveBeenCalledWith({
        query: 'external_reference:"order123"'
      });
    });
  });
});
