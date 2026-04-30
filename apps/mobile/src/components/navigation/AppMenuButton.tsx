import { FontAwesome } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/services/api/client';
import { useAuthStore } from '@/store/auth-store';
import { Role } from '@/types/models';

interface MenuAction {
  key: string;
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
  onPress: () => void | Promise<void>;
  visible?: boolean;
  tone?: 'default' | 'danger';
}

const roleHomeRoute = (role?: Role | null) => {
  if (role === 'admin') return '/admin-home';
  return '/(tabs)/home';
};

export const AppMenuButton = () => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const switchRole = useAuthStore((state) => state.switchRole);
  const [open, setOpen] = useState(false);
  const [roleLoading, setRoleLoading] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState<'login' | 'register' | 'logout' | null>(null);

  const activeRole = user?.activeRole || user?.role;

  const closeMenu = () => setOpen(false);
  const navigateAndClose = (href: string) => {
    closeMenu();
    router.push(href as never);
  };

  const handleRoleSwitch = async (role: Role) => {
    try {
      setRoleLoading(role);
      await switchRole(role);
      closeMenu();
      router.replace(roleHomeRoute(role) as never);
    } catch (error) {
      Alert.alert('Unable to switch role', getApiErrorMessage(error));
    } finally {
      setRoleLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthLoading('logout');
      await logout();
      closeMenu();
      router.replace('/login');
    } finally {
      setAuthLoading(null);
    }
  };

  const guestActions: MenuAction[] = [
    {
      key: 'onboarding',
      label: 'Onboarding',
      icon: 'home',
      onPress: () => navigateAndClose('/onboarding')
    },
    {
      key: 'login',
      label: authLoading === 'login' ? 'Opening login...' : 'Login',
      icon: 'sign-in',
      onPress: () => {
        setAuthLoading('login');
        navigateAndClose('/login');
        setAuthLoading(null);
      }
    },
    {
      key: 'register',
      label: authLoading === 'register' ? 'Opening register...' : 'Register',
      icon: 'user-plus',
      onPress: () => {
        setAuthLoading('register');
        navigateAndClose('/register');
        setAuthLoading(null);
      }
    }
  ];

  const userActions: MenuAction[] = [
    {
      key: 'home',
      label: activeRole === 'admin' ? 'Admin home' : 'Home',
      icon: 'home',
      onPress: () => {
        closeMenu();
        router.replace(roleHomeRoute(activeRole) as never);
      }
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: 'list-alt',
      onPress: () => navigateAndClose('/(tabs)/orders')
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: 'shopping-cart',
      visible: activeRole === 'buyer',
      onPress: () => navigateAndClose('/(tabs)/cart')
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      icon: 'heart',
      visible: activeRole === 'buyer',
      onPress: () => navigateAndClose('/(tabs)/wishlist')
    },
    {
      key: 'listings',
      label: 'Listings',
      icon: 'th-large',
      visible: activeRole === 'seller',
      onPress: () => navigateAndClose('/(tabs)/listings')
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: 'money',
      visible: activeRole === 'seller',
      onPress: () => navigateAndClose('/(tabs)/finance')
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: 'user',
      visible: activeRole !== 'admin',
      onPress: () => navigateAndClose('/(tabs)/profile')
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: 'bell',
      visible: activeRole !== 'admin',
      onPress: () => navigateAndClose('/notifications')
    },
    {
      key: 'support',
      label: 'Support center',
      icon: 'life-ring',
      visible: activeRole !== 'admin',
      onPress: () => navigateAndClose('/support')
    },
    {
      key: 'logout',
      label: authLoading === 'logout' ? 'Logging out...' : 'Logout',
      icon: 'sign-out',
      tone: 'danger',
      onPress: handleLogout
    }
  ];

  const switchActions = useMemo(() => {
    if (!user?.roles?.length) return [];
    return user.roles
      .filter((role) => role !== activeRole)
      .map((role) => ({
        key: `switch-${role}`,
        label: roleLoading === role ? `Switching to ${role}...` : `Switch to ${role}`,
        icon: 'exchange',
        onPress: () => handleRoleSwitch(role)
      }));
  }, [user?.roles, activeRole, roleLoading]);

  const visibleActions = (user ? userActions : guestActions).filter((action) => action.visible !== false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open app menu"
        onPress={() => setOpen(true)}
        className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
      >
        <FontAwesome name="bars" size={18} color="#0f172a" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <View className="flex-1 bg-black/30">
          <Pressable className="flex-1" onPress={closeMenu} />
          <View className="rounded-t-[28px] bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-black uppercase tracking-widest text-brand-700">
                  {user ? 'Marketloop account' : 'Marketloop menu'}
                </Text>
                <Text className="mt-1 text-2xl font-black text-slate-900">
                  {user ? user.name : 'Welcome'}
                </Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {user ? `${user.email} • ${activeRole} mode` : 'Login or register to start shopping and selling.'}
                </Text>
                {pathname ? <Text className="mt-1 text-xs text-slate-400">Current screen: {pathname}</Text> : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close app menu"
                onPress={closeMenu}
                className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <FontAwesome name="close" size={18} color="#334155" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
              <View className="gap-2 rounded-2xl bg-slate-50 p-3">
                {visibleActions.map((action) => (
                  <Pressable
                    key={action.key}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => void action.onPress()}
                    className={`flex-row items-center justify-between rounded-2xl px-3 py-3 ${
                      action.tone === 'danger' ? 'bg-rose-50' : 'bg-white'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className={`h-10 w-10 items-center justify-center rounded-full ${
                        action.tone === 'danger' ? 'bg-rose-100' : 'bg-emerald-50'
                      }`}>
                        <FontAwesome
                          name={action.icon}
                          size={16}
                          color={action.tone === 'danger' ? '#be123c' : '#059669'}
                        />
                      </View>
                      <Text className={`text-sm font-semibold ${action.tone === 'danger' ? 'text-rose-700' : 'text-slate-900'}`}>
                        {action.label}
                      </Text>
                    </View>
                    <FontAwesome name="angle-right" size={18} color="#94a3b8" />
                  </Pressable>
                ))}
              </View>

              {switchActions.length ? (
                <View className="gap-2 rounded-2xl bg-slate-50 p-3">
                  <Text className="px-1 text-xs font-black uppercase tracking-widest text-slate-400">Switch role</Text>
                  {switchActions.map((action) => (
                    <Pressable
                      key={action.key}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      onPress={() => void action.onPress()}
                      className="flex-row items-center justify-between rounded-2xl bg-white px-3 py-3"
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-sky-50">
                          <FontAwesome name="exchange" size={16} color="#0284c7" />
                        </View>
                        <Text className="text-sm font-semibold text-slate-900">{action.label}</Text>
                      </View>
                      <FontAwesome name="angle-right" size={18} color="#94a3b8" />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {!user ? (
                <View className="gap-3 pt-2">
                  <Button label="Login" onPress={() => navigateAndClose('/login')} />
                  <Button label="Register" variant="secondary" onPress={() => navigateAndClose('/register')} />
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
