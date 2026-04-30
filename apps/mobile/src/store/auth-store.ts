import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { authRepository } from '@/services/api/auth.repository';
import { userRepository } from '@/services/api/user.repository';
import { disconnectChatSocket } from '@/services/socket/chat-socket';
import { AuthSession, Role, UserProfile } from '@/types/models';

const TOKEN_KEY = 'marketloop.mobile.token';
const USER_KEY = 'marketloop.mobile.user';
const OTP_EMAIL_KEY = 'marketloop.mobile.pendingEmail';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  pendingVerificationEmail: string;
  isBootstrapping: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: 'buyer' | 'seller' }) => Promise<void>;
  verifyOtp: (payload: { email: string; otp: string }) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  bootstrap: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  hydrateSession: (session: AuthSession) => Promise<void>;
}

const persistSession = async (token: string, user: UserProfile) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  await SecureStore.deleteItemAsync(OTP_EMAIL_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  pendingVerificationEmail: '',
  isBootstrapping: true,
  hydrateSession: async (session) => {
    await persistSession(session.token, session.user);
    set({ token: session.token, user: session.user, pendingVerificationEmail: '', isBootstrapping: false });
  },
  bootstrap: async () => {
    const [token, userRaw, pendingVerificationEmail] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
      SecureStore.getItemAsync(OTP_EMAIL_KEY)
    ]);

    if (!token || !userRaw) {
      set({ token: null, user: null, pendingVerificationEmail: pendingVerificationEmail || '', isBootstrapping: false });
      return;
    }

    set({
      token,
      user: JSON.parse(userRaw) as UserProfile,
      pendingVerificationEmail: pendingVerificationEmail || '',
      isBootstrapping: false
    });

    try {
      const user = await authRepository.me();
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      set({ user });
    } catch {
      await get().logout();
    }
  },
  login: async (payload) => {
    const session = await authRepository.login(payload);
    await get().hydrateSession(session);
  },
  register: async (payload) => {
    const data = await authRepository.register(payload);
    await SecureStore.setItemAsync(OTP_EMAIL_KEY, data.email || payload.email);
    set({ pendingVerificationEmail: data.email || payload.email, isBootstrapping: false });
  },
  verifyOtp: async (payload) => {
    await authRepository.verifyOtp(payload);
    await SecureStore.deleteItemAsync(OTP_EMAIL_KEY);
    set({ pendingVerificationEmail: '', isBootstrapping: false });
  },
  resendOtp: async (email) => {
    const data = await authRepository.resendOtp(email);
    await SecureStore.setItemAsync(OTP_EMAIL_KEY, data.email || email);
    set({ pendingVerificationEmail: data.email || email, isBootstrapping: false });
  },
  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
      SecureStore.deleteItemAsync(OTP_EMAIL_KEY)
    ]);
    disconnectChatSocket();
    set({ token: null, user: null, pendingVerificationEmail: '', isBootstrapping: false });
  },
  switchRole: async (role) => {
    const user = get().user;
    if (!user) return;
    const nextUser = await userRepository.switchRole(role);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
    set({ user: nextUser });
  }
}));
