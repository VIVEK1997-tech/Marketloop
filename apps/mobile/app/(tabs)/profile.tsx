import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const switchRole = useAuthStore((state) => state.switchRole);
  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: userRepository.getProfile,
    enabled: !!user
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: userRepository.getNotifications,
    enabled: !!user
  });

  if (!user) {
    return (
      <Screen>
        <EmptyState title="No active session" description="Sign in to view your MarketLoop profile, notifications, and role-specific shortcuts." />
      </Screen>
    );
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Profile" subtitle="Manage your account, switch roles, and jump into the areas you use most." />

        <Card>
          <Text className="text-sm font-black uppercase tracking-widest text-brand-700">Account</Text>
          <Text className="mt-2 text-2xl font-black text-slate-900">{user.name}</Text>
          <Text className="mt-2 text-sm text-slate-500">{user.email}</Text>
          <Text className="mt-1 text-sm text-slate-500">{user.phone || 'Phone not added yet'}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <StatusPill label={`Active role: ${user.activeRole}`} tone="info" />
            <StatusPill label={user.isVerified ? 'Verified' : 'Unverified'} tone={user.isVerified ? 'success' : 'warning'} />
          </View>
        </Card>

        {user.roles?.filter((role) => role !== user.activeRole).map((role) => (
          <Button key={role} label={`Switch to ${role}`} variant="secondary" onPress={() => switchRole(role)} />
        ))}

        <Button label={`Notifications${unreadNotifications ? ` (${unreadNotifications})` : ''}`} variant="secondary" onPress={() => router.push('/notifications' as never)} />
        <Button label="Support center" variant="secondary" onPress={() => router.push('/support' as never)} />
        <Button label="Open invoices" variant="secondary" onPress={() => router.push('/invoices')} />
        <Button label="Payment history" variant="secondary" onPress={() => router.push('/payments/history')} />
        <Button label="Chat inbox" variant="secondary" onPress={() => router.push('/chat')} />
        <Button label="Wishlist" variant="secondary" onPress={() => router.push('/(tabs)/wishlist')} />

        {data?.stats ? (
          <Card>
            <Text className="text-lg font-bold text-slate-900">Profile stats</Text>
            <Text className="mt-3 text-sm text-slate-500">Wishlist: {String(data.stats.wishlistCount || 0)}</Text>
            <Text className="mt-1 text-sm text-slate-500">Conversations: {String(data.stats.conversationCount || 0)}</Text>
            <Text className="mt-1 text-sm text-slate-500">Listings: {String(data.stats.listingsCount || 0)}</Text>
            <Text className="mt-1 text-sm text-slate-500">Member since: {data.stats.memberSince ? new Date(String(data.stats.memberSince)).toLocaleDateString() : 'N/A'}</Text>
          </Card>
        ) : null}

        <Button label="Logout" onPress={logout} />
      </View>
    </Screen>
  );
}
