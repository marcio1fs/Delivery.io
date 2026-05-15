import api from './api';
import type { 
  Order, 
  Rider, 
  Establishment, 
  EstablishmentProfile, 
  Transaction,
  Integration,
  User,
  LoginCredentials,
  AuthResponse,
  DashboardStats,
  PaginatedResponse,
} from '../types';

// Auth Services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  refreshToken: async (): Promise<string> => {
    const response = await api.post<{ token: string }>('/auth/refresh');
    localStorage.setItem('auth_token', response.data.token);
    return response.data.token;
  },
};

// Order Services
export const orderService = {
  getAll: async (params?: { 
    status?: string; 
    platform?: string; 
    page?: number; 
    limit?: number;
  }): Promise<PaginatedResponse<Order>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<PaginatedResponse<Order>>(`/orders?${queryParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post<Order>('/orders', orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  assignRider: async (orderId: string, riderId: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${orderId}/assign`, { riderId });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  getAvailable: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/available');
    return response.data;
  },
};

// Rider Services
export const riderService = {
  getAll: async (params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
  }): Promise<PaginatedResponse<Rider>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<PaginatedResponse<Rider>>(`/riders?${queryParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Rider> => {
    const response = await api.get<Rider>(`/riders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: Rider['status']): Promise<Rider> => {
    const response = await api.patch<Rider>(`/riders/${id}/status`, { status });
    return response.data;
  },

  toggleFavorite: async (riderId: string): Promise<void> => {
    await api.post(`/riders/${riderId}/favorite`);
  },

  toggleBlock: async (riderId: string): Promise<void> => {
    await api.post(`/riders/${riderId}/block`);
  },

  getAvailableNearby: async (latitude: number, longitude: number, radiusKm?: number): Promise<Rider[]> => {
    const response = await api.get<Rider[]>('/riders/nearby', { 
      params: { latitude, longitude, radius: radiusKm || 5 } 
    });
    return response.data;
  },

  getProfile: async (): Promise<Rider> => {
    const response = await api.get<Rider>('/riders/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<Rider>): Promise<Rider> => {
    const response = await api.put<Rider>('/riders/profile', data);
    return response.data;
  },
};

// Establishment Services
export const establishmentService = {
  getProfile: async (): Promise<EstablishmentProfile> => {
    const response = await api.get<EstablishmentProfile>('/establishments/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<EstablishmentProfile>): Promise<EstablishmentProfile> => {
    const response = await api.put<EstablishmentProfile>('/establishments/profile', data);
    return response.data;
  },

  getAll: async (params?: { 
    status?: string;
    page?: number; 
    limit?: number;
  }): Promise<PaginatedResponse<Establishment>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<PaginatedResponse<Establishment>>(`/establishments?${queryParams}`);
    return response.data;
  },

  getById: async (id: string): Promise<Establishment> => {
    const response = await api.get<Establishment>(`/establishments/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<Establishment> => {
    const response = await api.post<Establishment>(`/establishments/${id}/toggle-status`);
    return response.data;
  },

  toggleBlock: async (id: string): Promise<Establishment> => {
    const response = await api.post<Establishment>(`/establishments/${id}/toggle-block`);
    return response.data;
  },

  create: async (data: Partial<Establishment>): Promise<Establishment> => {
    const response = await api.post<Establishment>('/establishments', data);
    return response.data;
  },
};

// Financial Services
export const financialService = {
  getTransactions: async (params?: { 
    type?: string; 
    startDate?: string; 
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Transaction>> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<PaginatedResponse<Transaction>>(`/financials/transactions?${queryParams}`);
    return response.data;
  },

  getBalance: async (): Promise<{ balance: number; creditLimit: number }> => {
    const response = await api.get<{ balance: number; creditLimit: number }>('/financials/balance');
    return response.data;
  },

  addCredit: async (amount: number, paymentMethod: string): Promise<Transaction> => {
    const response = await api.post<Transaction>('/financials/credit', { amount, paymentMethod });
    return response.data;
  },

  requestWithdrawal: async (amount: number): Promise<Transaction> => {
    const response = await api.post<Transaction>('/financials/withdrawal', { amount });
    return response.data;
  },

  getRevenueReport: async (period: 'daily' | 'weekly' | 'monthly', startDate?: string, endDate?: string): Promise<any> => {
    const response = await api.get('/financials/revenue', { 
      params: { period, startDate, endDate } 
    });
    return response.data;
  },
};

// Integration Services
export const integrationService = {
  getAll: async (): Promise<Integration[]> => {
    const response = await api.get<Integration[]>('/integrations');
    return response.data;
  },

  connect: async (integrationId: string, credentials: Record<string, string>): Promise<Integration> => {
    const response = await api.post<Integration>(`/integrations/${integrationId}/connect`, credentials);
    return response.data;
  },

  disconnect: async (integrationId: string): Promise<void> => {
    await api.post(`/integrations/${integrationId}/disconnect`);
  },

  testConnection: async (integrationId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(`/integrations/${integrationId}/test`);
    return response.data;
  },
};

// Dashboard Stats Service
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async (limit?: number): Promise<any[]> => {
    const response = await api.get('/dashboard/activity', { params: { limit } });
    return response.data;
  },

  getOrdersChart: async (period: '7d' | '30d' | '90d'): Promise<any> => {
    const response = await api.get('/dashboard/charts/orders', { params: { period } });
    return response.data;
  },

  getRevenueChart: async (period: '7d' | '30d' | '90d'): Promise<any> => {
    const response = await api.get('/dashboard/charts/revenue', { params: { period } });
    return response.data;
  },
};

// Notification Services
export const notificationService = {
  getAll: async (unreadOnly?: boolean): Promise<any[]> => {
    const response = await api.get('/notifications', { params: { unread: unreadOnly } });
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

export default {
  auth: authService,
  order: orderService,
  rider: riderService,
  establishment: establishmentService,
  financial: financialService,
  integration: integrationService,
  dashboard: dashboardService,
  notification: notificationService,
};
