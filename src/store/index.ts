import { create } from 'zustand';
import type { User, Order, Rider, EstablishmentProfile, Notification } from '../types';
import { authService, orderService, riderService, establishmentService, notificationService } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao fazer login', 
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },
  
  register: async (userData: Partial<User> & { password: string }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao registrar', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: () => {
    const user = authService.getCurrentUser();
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (params?: any) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  assignRider: (orderId: string, riderId: string) => Promise<void>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  
  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderService.getAll(params);
      set({ orders: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao buscar pedidos', 
        isLoading: false 
      });
    }
  },
  
  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderService.getById(id);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao buscar pedido', 
        isLoading: false 
      });
    }
  },
  
  updateOrderStatus: async (id: string, status: Order['status']) => {
    try {
      await orderService.updateStatus(id, status);
      set((state) => ({
        orders: state.orders.map((order) => 
          order.id === id ? { ...order, status } : order
        ),
        currentOrder: state.currentOrder?.id === id 
          ? { ...state.currentOrder, status } 
          : state.currentOrder,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao atualizar status' });
      throw error;
    }
  },
  
  assignRider: async (orderId: string, riderId: string) => {
    try {
      await orderService.assignRider(orderId, riderId);
      set((state) => ({
        orders: state.orders.map((order) => 
          order.id === orderId ? { ...order, riderId, status: 'Aceito' as OrderStatus } : order
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao atribuir entregador' });
      throw error;
    }
  },
  
  cancelOrder: async (id: string, reason: string) => {
    try {
      await orderService.cancel(id, reason);
      set((state) => ({
        orders: state.orders.map((order) => 
          order.id === id ? { ...order, status: 'Cancelado' as OrderStatus } : order
        ),
        currentOrder: state.currentOrder?.id === id 
          ? { ...state.currentOrder, status: 'Cancelado' as OrderStatus } 
          : state.currentOrder,
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao cancelar pedido' });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));

interface RiderState {
  riders: Rider[];
  currentRider: Rider | null;
  isLoading: boolean;
  error: string | null;
  fetchRiders: (params?: any) => Promise<void>;
  fetchRiderById: (id: string) => Promise<void>;
  toggleFavorite: (riderId: string) => Promise<void>;
  toggleBlock: (riderId: string) => Promise<void>;
  clearError: () => void;
}

export const useRiderStore = create<RiderState>((set) => ({
  riders: [],
  currentRider: null,
  isLoading: false,
  error: null,
  
  fetchRiders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await riderService.getAll(params);
      set({ riders: response.data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao buscar entregadores', 
        isLoading: false 
      });
    }
  },
  
  fetchRiderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const rider = await riderService.getById(id);
      set({ currentRider: rider, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao buscar entregador', 
        isLoading: false 
      });
    }
  },
  
  toggleFavorite: async (riderId: string) => {
    try {
      await riderService.toggleFavorite(riderId);
      set((state) => ({
        riders: state.riders.map((rider) => 
          rider.id === riderId ? { ...rider, isFavorite: !rider.isFavorite } : rider
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao atualizar favorito' });
      throw error;
    }
  },
  
  toggleBlock: async (riderId: string) => {
    try {
      await riderService.toggleBlock(riderId);
      set((state) => ({
        riders: state.riders.map((rider) => 
          rider.id === riderId ? { ...rider, isBlocked: !rider.isBlocked } : rider
        ),
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao bloquear entregador' });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));

interface EstablishmentState {
  profile: EstablishmentProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<EstablishmentProfile>) => Promise<void>;
  clearError: () => void;
}

export const useEstablishmentStore = create<EstablishmentState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await establishmentService.getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erro ao buscar perfil', 
        isLoading: false 
      });
    }
  },
  
  updateProfile: async (data: Partial<EstablishmentProfile>) => {
    try {
      const profile = await establishmentService.updateProfile(data);
      set({ profile });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Erro ao atualizar perfil' });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
}));

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  fetchNotifications: async (unreadOnly) => {
    set({ isLoading: true });
    try {
      const notifications = await notificationService.getAll(unreadOnly);
      set({ 
        notifications, 
        unreadCount: notifications.filter((n) => !n.read).length,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },
  
  markAsRead: async (id: string) => {
    await notificationService.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => 
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  
  markAllAsRead: async () => {
    await notificationService.markAllAsRead();
    set({ 
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
}));
