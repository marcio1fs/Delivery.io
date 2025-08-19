import { 
  EstablishmentProfile,
  Order, 
  Transaction, 
  OrderPlatform, 
  OrderStatus, 
  TransactionType,
  Rider,
  RiderStatus,
  Establishment,
  EstablishmentStatus,
  Integration,
  IntegrationStatus,
  TechStack
} from './types';

export const platformStats = {
    totalRevenue: 85450.75,
    totalDeliveries: 1240,
    activeRiders: 3,
    partnerEstablishments: 3,
};

export const establishmentProfile: EstablishmentProfile = {
  id: 'E001',
  name: 'Burger Queen',
  logo: 'https://logo.clearbit.com/burgerking.com',
  address: 'Alameda dos Anjos, 789',
  category: 'Fast Food',
  email: 'manager@burgerqueen.com',
  creditBalance: 313.25,
  transactionHistory: [
    { id: 'TRN001', type: TransactionType.Credit, amount: 500.00, timestamp: '2 dias atrás', description: 'Compra de Crédito' },
    { id: 'TRN002', type: TransactionType.Debit, amount: -15.00, timestamp: 'Ontem', description: 'Entrega #ORD101' },
    { id: 'TRN003', type: TransactionType.Debit, amount: -22.50, timestamp: 'Hoje', description: 'Entrega #ORD102 (Prioridade)' },
    { id: 'TRN004', type: TransactionType.Debit, amount: -18.00, timestamp: '2 horas atrás', description: 'Entrega #ORD104' },
    { id: 'TRN005', type: TransactionType.Refund, amount: 14.20, timestamp: '1 dia atrás', description: 'Reembolso para #ORD105' },
    { id: 'TRN006', type: TransactionType.Debit, amount: -144.45, timestamp: '1 dia atrás', description: 'Taxa de Serviço Semanal' },
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), // Dummy sort for realism
  favoriteRiders: ['R002'],
};

export const orders: Order[] = [
    { id: 'ORD102', platform: OrderPlatform.iFood, pickupAddress: 'Burger Queen', deliveryAddress: 'Av. Principal, 456', distance: 5.2, deliveryFee: 22.50, status: OrderStatus.InProgress, customerName: 'José Lima', riderName: 'Ana Pereira', riderId: 'R002', timestamp: 'Em andamento', priority: true },
    { id: 'ORD103', platform: OrderPlatform.Rappi, pickupAddress: 'Burger Queen', deliveryAddress: 'Alameda dos Anjos, 789', distance: 2.8, deliveryFee: 12.00, status: OrderStatus.Pending, customerName: 'Fernanda Costa', timestamp: 'Aguardando' },
    { id: 'ORD101', platform: OrderPlatform.InHouse, pickupAddress: 'Burger Queen', deliveryAddress: 'Rua das Flores, 123', distance: 3.5, deliveryFee: 15.00, status: OrderStatus.Delivered, customerName: 'Maria Oliveira', riderName: 'Carlos Silva', riderId: 'R001', timestamp: '5 min atrás' },
    { id: 'ORD104', platform: OrderPlatform.InHouse, pickupAddress: 'Burger Queen', deliveryAddress: 'Praça da Sé, 303', distance: 6.3, deliveryFee: 18.00, status: OrderStatus.Delivered, customerName: 'Ricardo Alves', riderName: 'João Santos', riderId: 'R003', timestamp: '2 horas atrás', requiresPaymentMachine: true },
    { id: 'ORD105', platform: OrderPlatform.i99, pickupAddress: 'Burger Queen', deliveryAddress: 'Rua da Paz, 101', distance: 4.1, deliveryFee: 14.20, status: OrderStatus.Cancelled, customerName: 'Beatriz Souza', riderName: 'Carlos Silva', riderId: 'R001', timestamp: 'Ontem' },
    { id: 'ORD106', platform: OrderPlatform.InHouse, pickupAddress: 'Burger Queen', deliveryAddress: 'Av. Brasil, 1500', distance: 7.1, deliveryFee: 25.00, status: OrderStatus.Delivered, customerName: 'Lucas Martins', riderName: 'Mariana Costa', riderId: 'R004', timestamp: 'Ontem' },
    { id: 'ORD107', platform: OrderPlatform.iFood, pickupAddress: 'Burger Queen', deliveryAddress: 'Rua Augusta, 500', distance: 3.9, deliveryFee: 13.50, status: OrderStatus.Delivered, customerName: 'Gabriela Dias', riderName: 'Carlos Silva', riderId: 'R001', timestamp: '3 dias atrás' },
];

export const riders: Rider[] = [
    { id: 'R001', name: 'Carlos Silva', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', status: RiderStatus.Online, deliveries: 12, rating: 4.9, isBlocked: false },
    { id: 'R002', name: 'Ana Pereira', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', status: RiderStatus.Delivering, deliveries: 8, rating: 4.7, isFavorite: true, isBlocked: false },
    { id: 'R003', name: 'João Santos', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', status: RiderStatus.Offline, deliveries: 25, rating: 4.8, isBlocked: true },
    { id: 'R004', name: 'Mariana Costa', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704g', status: RiderStatus.Online, deliveries: 5, rating: 5.0, isBlocked: false },
];

export const financialData = [
    { month: 'Jan', revenue: 4000, payouts: 2400, profit: 1600 },
    { month: 'Fev', revenue: 3000, payouts: 1398, profit: 1602 },
    { month: 'Mar', revenue: 9800, payouts: 2000, profit: 7800 },
    { month: 'Abr', revenue: 3908, payouts: 2780, profit: 1128 },
    { month: 'Mai', revenue: 4800, payouts: 1890, profit: 2910 },
    { month: 'Jun', revenue: 3800, payouts: 2390, profit: 1410 },
];

export const establishments: Establishment[] = [
    { id: 'E001', name: 'Burger Queen', logo: 'https://logo.clearbit.com/burgerking.com', address: 'Alameda dos Anjos, 789', category: 'Fast Food', status: EstablishmentStatus.Open, revenue: 12500.50, rating: 4.5, isBlocked: false },
    { id: 'E002', name: 'Pizza Planet', logo: 'https://logo.clearbit.com/pizzahut.com', address: 'Rua do Universo, 42', category: 'Pizza', status: EstablishmentStatus.Open, revenue: 25000.00, rating: 4.8, isBlocked: false },
    { id: 'E003', name: 'Sushi Station', logo: 'https://logo.clearbit.com/sushiexpress.com', address: 'Av. Japão, 123', category: 'Sushi', status: EstablishmentStatus.Closed, revenue: 8500.75, rating: 4.2, isBlocked: true },
];

export const availableOrders: Order[] = [
    { 
        id: 'ORD201', 
        platform: OrderPlatform.iFood, 
        pickupAddress: 'Pizza Planet, Rua do Universo, 42', 
        deliveryAddress: 'Condomínio Estelar, Bloco B, Ap 101', 
        distance: 4.5, 
        deliveryFee: 18.00,
        earnings: 15.00,
        status: OrderStatus.Pending, 
        customerName: 'Neil Armstrong', 
        timestamp: 'Novo',
        pickupCode: '1234',
        deliveryCode: '5678'
    },
    { 
        id: 'ORD202', 
        platform: OrderPlatform.Rappi, 
        pickupAddress: 'Sushi Station, Av. Japão, 123', 
        deliveryAddress: 'Rua das Cerejeiras, 55', 
        distance: 2.1, 
        deliveryFee: 10.00,
        earnings: 8.50,
        status: OrderStatus.Pending, 
        customerName: 'Sakura Kinomoto', 
        timestamp: 'Novo',
        pickupCode: '4321',
        deliveryCode: '8765'
    },
];

export const integrations: Integration[] = [
    { id: 'ifood', name: 'iFood', logo: 'https://logo.clearbit.com/ifood.com.br', description: 'Recepção de pedidos da plataforma iFood.', status: IntegrationStatus.Connected, apiKey: '**********', webhookUrl: 'https://api.deliver.io/webhooks/ifood' },
    { id: '99food', name: '99Food', logo: 'https://logo.clearbit.com/99app.com', description: 'Recepção de pedidos da plataforma 99Food.', status: IntegrationStatus.NotConnected },
    { id: 'keeta', name: 'Keeta', logo: 'https://logo.clearbit.com/keeta.com', description: 'Futura integração para gestão de pedidos.', status: IntegrationStatus.NotConnected },
    { id: 'rappi', name: 'Rappi', logo: 'https://logo.clearbit.com/rappi.com', description: 'Recepção de pedidos da plataforma Rappi.', status: IntegrationStatus.Connected, apiKey: '**********', clientId: '**********' },
    { id: 'uberdirect', name: 'Uber Direct', logo: 'https://logo.clearbit.com/uber.com', description: 'Entregas sob demanda via Uber Direct.', status: IntegrationStatus.NotConnected },
    { id: '99entregas', name: '99 Entregas', logo: 'https://logo.clearbit.com/99app.com', description: 'Entregas sob demanda via 99 Entregas.', status: IntegrationStatus.Pending },
    { id: 'boxdelivery', name: 'Box Delivery', logo: 'https://logo.clearbit.com/boxdelivery.com.br', description: 'Entregas sob demanda com Box Delivery.', status: IntegrationStatus.NotConnected },
    { id: 'rappicargo', name: 'Rappi Cargo', logo: 'https://logo.clearbit.com/rappi.com', description: 'Logística e envios com Rappi Cargo.', status: IntegrationStatus.NotConnected },
    { id: 'deliva', name: 'Deliva', logo: 'https://logo.clearbit.com/deliva.com.br', description: 'Gestão de logística e entregas.', status: IntegrationStatus.NotConnected },
    { id: 'saipos', name: 'Saipos', logo: 'https://logo.clearbit.com/saipos.com', description: 'Integração com sistema de gestão de restaurantes.', status: IntegrationStatus.Connected, apiKey: '**********' },
];

export const techStack: TechStack = {
  frontendMobile: {
    title: 'Frontend Mobile (Android/iOS)',
    items: ['Flutter', 'React Native'],
  },
  frontendWeb: {
    title: 'Painel Web',
    items: ['React.js', 'Vue.js'],
  },
  backend: {
    title: 'Backend',
    items: ['Node.js (Express/NestJS)', 'Java (Spring)'],
  },
  database: {
    title: 'Banco de Dados',
    items: ['PostgreSQL', 'MongoDB'],
  },
  authentication: {
    title: 'Autenticação',
    items: ['JWT (JSON Web Token)', 'OAuth'],
  },
  hosting: {
    title: 'Hospedagem & Infraestrutura',
    items: ['AWS (Amazon Web Services)', 'GCP (Google Cloud Platform)', 'Azure'],
  },
  notifications: {
    title: 'Notificações Push',
    items: ['Firebase Cloud Messaging'],
  },
  maps: {
    title: 'Mapas & Geolocalização',
    items: ['Google Maps API'],
  },
};