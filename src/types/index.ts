// User and Auth Types
export type UserRole = 'admin' | 'establishment' | 'rider';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  establishmentId?: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Order Types
export enum OrderPlatform {
  iFood = 'iFood',
  Rappi = 'Rappi',
  i99 = '99',
  InHouse = 'Interno',
}

export enum OrderStatus {
  Pending = 'Pendente',
  Accepted = 'Aceito',
  InProgress = 'Em Andamento',
  AtPickup = 'No Local de Coleta',
  PickedUp = 'Coletado',
  AtDestination = 'No Destino',
  Delivered = 'Entregue',
  Cancelled = 'Cancelado',
}

export interface Order {
  id: string;
  platform: OrderPlatform;
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  deliveryFee: number;
  status: OrderStatus;
  customerName: string;
  riderName?: string;
  riderId?: string;
  timestamp: string;
  requiresPaymentMachine?: boolean;
  priority?: boolean;
  earnings?: number;
  pickupCode?: string;
  deliveryCode?: string;
  items?: OrderItem[];
  totalAmount: number;
  establishmentId: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
}

// Rider Types
export enum RiderStatus {
  Online = 'Online',
  Offline = 'Offline',
  Delivering = 'Em Entrega',
}

export interface Rider {
  id: string;
  name: string;
  avatar: string;
  status: RiderStatus;
  deliveries: number;
  rating: number;
  isFavorite?: boolean;
  isBlocked?: boolean;
  phone?: string;
  vehicleType?: string;
  licensePlate?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface RiderProfile extends Rider {
  balance: number;
  transactionHistory: Transaction[];
}

// Establishment Types
export enum EstablishmentStatus {
  Open = 'Aberto',
  Closed = 'Fechado',
}

export interface Establishment {
  id: string;
  name: string;
  logo: string;
  address: string;
  category: string;
  status: EstablishmentStatus;
  revenue: number;
  rating: number;
  isBlocked?: boolean;
  email?: string;
  phone?: string;
  ownerId?: string;
}

export interface EstablishmentProfile extends Establishment {
  creditBalance: number;
  transactionHistory: Transaction[];
  favoriteRiders: string[];
  description?: string;
  openingHours?: {
    [key: string]: { open: string; close: string };
  };
}

// Financial Types
export enum TransactionType {
  Credit = 'Crédito',
  Debit = 'Débito',
  Refund = 'Reembolso',
  Earning = 'Ganho',
  Withdrawal = 'Saque',
  EarlyWithdrawal = 'Saque Antecipado',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  timestamp: string;
  description: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'failed';
}

// Integration Types
export enum IntegrationStatus {
  Connected = 'Conectado',
  NotConnected = 'Não Conectado',
  Pending = 'Pendente',
}

export interface Integration {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: IntegrationStatus;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  lastSync?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  totalDeliveries: number;
  activeRiders: number;
  pendingOrders: number;
  todayOrders: number;
  averageDeliveryTime: number;
  revenueGrowth: number;
}

export interface ChartData {
  month: string;
  revenue: number;
  payouts: number;
  profit: number;
}

// Tech Stack Types
export interface TechCategory {
  title: string;
  items: string[];
}

export interface TechStack {
  [key: string]: TechCategory;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

// Settings Types
export interface AppSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark';
  language: 'pt-BR' | 'en';
  timezone: string;
}
