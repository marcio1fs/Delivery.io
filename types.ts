// Keeping Order enums as they are useful
export enum OrderPlatform {
  iFood = 'iFood',
  Rappi = 'Rappi',
  i99 = '99',
  InHouse = 'Interno',
}

export enum OrderStatus {
  Pending = 'Pendente', // Waiting for rider
  Accepted = 'Aceito', // Rider assigned
  InProgress = 'Em Andamento', // Rider en route
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
  distance: number; // in km
  deliveryFee: number;
  status: OrderStatus;
  
  // New properties for Establishment view
  customerName: string;
  riderName?: string; // Optional because it might be pending
  riderId?: string;
  timestamp: string;
  requiresPaymentMachine?: boolean;
  priority?: boolean;

  // For rider view
  earnings?: number;
  pickupCode?: string;
  deliveryCode?: string;
}


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
}

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
}

export interface RiderProfile extends Rider {
  balance: number;
  transactionHistory: Transaction[];
}

// Single Establishment Profile, not a list
export interface EstablishmentProfile {
  id: string;
  name: string;
  logo: string;
  address: string;
  category: string;
  email: string;
  creditBalance: number;
  transactionHistory: Transaction[];
  favoriteRiders: string[]; // list of rider IDs
}

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
}

// For Admin Integrations Page
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
}

// For Admin Tech Stack Page
export interface TechCategory {
  title: string;
  items: string[];
}

export interface TechStack {
  [key: string]: TechCategory;
}