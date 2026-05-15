import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'establishment', 'rider']),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Order Schema
export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().min(10, 'Telefone inválido'),
  pickupAddress: z.string().min(5, 'Endereço de coleta é obrigatório'),
  deliveryAddress: z.string().min(5, 'Endereço de entrega é obrigatório'),
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    observations: z.string().optional(),
  })).min(1, 'Adicione pelo menos um item'),
  platform: z.enum(['iFood', 'Rappi', '99', 'Interno']),
  requiresPaymentMachine: z.boolean().optional(),
  priority: z.boolean().optional(),
  paymentMethod: z.enum(['credit', 'debit', 'cash', 'pix']),
  totalAmount: z.number().min(0),
});

export type CreateOrderFormData = z.infer<typeof createOrderSchema>;

// Establishment Profile Schema
export const establishmentProfileSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().optional(),
  openingHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
});

export type EstablishmentProfileFormData = z.infer<typeof establishmentProfileSchema>;

// Rider Profile Schema
export const riderProfileSchema = z.object({
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  vehicleType: z.string().min(1, 'Tipo de veículo é obrigatório'),
  licensePlate: z.string().min(7, 'Placa inválida').max(8),
});

export type RiderProfileFormData = z.infer<typeof riderProfileSchema>;

// Add Credit Schema
export const addCreditSchema = z.object({
  amount: z.number().min(10, 'Valor mínimo é R$ 10,00'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'pix', 'boleto']),
});

export type AddCreditFormData = z.infer<typeof addCreditSchema>;

// Withdrawal Schema
export const withdrawalSchema = z.object({
  amount: z.number().min(50, 'Valor mínimo para saque é R$ 50,00'),
  bankAccount: z.object({
    bank: z.string().min(1, 'Banco é obrigatório'),
    agency: z.string().min(4, 'Agência inválida'),
    account: z.string().min(5, 'Conta inválida'),
    accountDigit: z.string().length(1, 'Dígito inválido'),
  }),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

// Integration Connection Schema
export const integrationConnectionSchema = z.object({
  apiKey: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  webhookUrl: z.string().url('URL inválida').optional(),
});

export type IntegrationConnectionFormData = z.infer<typeof integrationConnectionSchema>;

// Cancel Order Schema
export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Descreva o motivo do cancelamento'),
  refundAmount: z.number().min(0).optional(),
});

export type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

// Contact Support Schema
export const contactSupportSchema = z.object({
  subject: z.string().min(5, 'Assunto é obrigatório'),
  message: z.string().min(20, 'Mensagem muito curta'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export type ContactSupportFormData = z.infer<typeof contactSupportSchema>;
