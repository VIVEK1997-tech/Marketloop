import { apiClient } from './client';
import { AuthSession, UserProfile } from '@/types/models';

export const authRepository = {
  register: async (payload: { name: string; email: string; password: string; phone?: string; role?: 'buyer' | 'seller' }) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },
  verifyOtp: async (payload: { email: string; otp: string }) => {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  },
  resendOtp: async (email: string) => {
    const { data } = await apiClient.post('/auth/resend-otp', { email });
    return data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<AuthSession>('/auth/login', payload);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<{ user: UserProfile }>('/auth/me');
    return data.user;
  }
};
