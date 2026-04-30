import { apiClient } from './client';
import { AppNotification, CartEntry, MarketplaceProduct, SellerDashboardSummary, SupportComplaint, UserProfile } from '@/types/models';

export const userRepository = {
  getProfile: async () => {
    const { data } = await apiClient.get<{ user: UserProfile; stats: Record<string, unknown> }>('/users/profile');
    return data;
  },
  updateProfile: async (payload: Partial<UserProfile>) => {
    const { data } = await apiClient.put<{ user: UserProfile }>('/users/profile', payload);
    return data.user;
  },
  switchRole: async (role: 'buyer' | 'seller' | 'admin') => {
    const { data } = await apiClient.post<{ user: UserProfile }>('/users/roles/switch', { role });
    return data.user;
  },
  getWishlist: async () => {
    const { data } = await apiClient.get<{ wishlist: MarketplaceProduct[] }>('/users/wishlist');
    return data.wishlist || [];
  },
  getCart: async () => {
    const { data } = await apiClient.get<{ cart: CartEntry[] }>('/users/cart');
    return data.cart || [];
  },
  updateCartItem: async (productId: string, quantity: number) => {
    const { data } = await apiClient.put<{ cart: CartEntry[] }>(`/users/cart/${productId}`, { quantity });
    return data.cart || [];
  },
  removeCartItem: async (productId: string) => {
    const { data } = await apiClient.delete<{ cart: CartEntry[] }>(`/users/cart/${productId}`);
    return data.cart || [];
  },
  clearCart: async () => {
    const { data } = await apiClient.delete<{ cart: CartEntry[] }>('/users/cart');
    return data.cart || [];
  },
  addToWishlist: async (productId: string) => {
    const { data } = await apiClient.post<{ wishlist: MarketplaceProduct[] }>(`/users/wishlist/${productId}`);
    return data.wishlist || [];
  },
  removeFromWishlist: async (productId: string) => {
    const { data } = await apiClient.delete<{ wishlist: MarketplaceProduct[] }>(`/users/wishlist/${productId}`);
    return data.wishlist || [];
  },
  registerPushToken: async (payload: { token: string; platform: 'android' | 'ios' | 'web'; deviceName?: string }) => {
    const { data } = await apiClient.post('/users/push-token', payload);
    return data;
  },
  getNotifications: async () => {
    const { data } = await apiClient.get<{ notifications: AppNotification[] }>('/users/notifications');
    return data.notifications || [];
  },
  markNotificationRead: async (notificationId: string) => {
    const { data } = await apiClient.patch(`/users/notifications/${notificationId}/read`);
    return data;
  },
  getSupportComplaints: async () => {
    const { data } = await apiClient.get<{ complaints: SupportComplaint[] }>('/users/support/complaints');
    return data.complaints || [];
  },
  getSupportComplaintDetail: async (complaintId: string) => {
    const { data } = await apiClient.get<{ complaint: SupportComplaint }>(`/users/support/complaints/${complaintId}`);
    return data.complaint;
  },
  createSupportComplaint: async (payload: {
    complaintType: string;
    against: string;
    note: string;
    linkedOrderId?: string;
    linkedPaymentId?: string;
  }) => {
    const { data } = await apiClient.post<{ complaint: SupportComplaint }>('/users/support/complaints', payload);
    return data.complaint;
  },
  getSellerSummary: async () => {
    const { data } = await apiClient.get<{ summary: SellerDashboardSummary }>('/users/seller-summary');
    return data.summary;
  }
};
