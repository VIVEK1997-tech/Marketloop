import { PropsWithChildren, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/query-client';
import { registerDevicePushToken } from '@/services/notifications/push-registration';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import '../../global.css';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const user = useAuthStore((state) => state.user);
  const hydrateCart = useCartStore((state) => state.hydrateFromServer);
  const resetCartForGuest = useCartStore((state) => state.resetForGuest);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const registerPushToken = async () => {
      const result = await registerDevicePushToken();
      if (cancelled || !__DEV__) return;
      if (!result.registered) {
        console.info(`[app-providers] push registration skipped: ${result.reason}`);
      }
    };

    registerPushToken().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      resetCartForGuest();
      return;
    }

    hydrateCart().catch(() => undefined);
  }, [hydrateCart, resetCartForGuest, user?.id]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GestureHandlerRootView>
  );
};
