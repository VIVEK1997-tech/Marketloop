import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { useAuthStore } from '@/store/auth-store';

const adminActions = [
  { title: 'Reports', subtitle: 'Business snapshots and exports', icon: 'line-chart' },
  { title: 'Safety', subtitle: 'Alerts, complaints, and blocked users', icon: 'shield' },
  { title: 'Orders', subtitle: 'Track operational flow quickly', icon: 'list-alt' },
  { title: 'Invoices', subtitle: 'Finance overview and status', icon: 'file-text-o' }
] as const;

export default function AdminHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const switchRole = useAuthStore((state) => state.switchRole);

  return (
    <Screen>
      <View className="gap-6">
        <Card>
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-brand-700">Admin workspace</Text>
          <Text className="mt-2 text-3xl font-black text-slate-900">Welcome to Marketloop Admin</Text>
          <Text className="mt-3 text-sm leading-6 text-slate-500">
            This admin entry is intentionally separate from the buyer and seller landing experience so operations stays distinct from normal app usage.
          </Text>
          <View className="mt-4 rounded-[18px] bg-slate-50 p-4">
            <Text className="text-sm font-semibold text-slate-800">{user?.name || 'Admin user'}</Text>
            <Text className="mt-1 text-sm text-slate-500">{user?.email}</Text>
          </View>
        </Card>

        <View className="gap-3">
          <Text className="text-2xl font-black text-slate-900">Admin sections</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {adminActions.map((action) => (
              <Pressable key={action.title} className="w-[48%]">
                <Card>
                  <View className="gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                      <FontAwesome name={action.icon as never} size={18} color="#16a34a" />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-900">{action.title}</Text>
                      <Text className="mt-1 text-xs leading-5 text-slate-500">{action.subtitle}</Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Admin note</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            The full admin control panel remains a dedicated operational surface. This mobile entry keeps admin concerns clearly separated from shopper and seller landing pages.
          </Text>
        </Card>

        <Button label="Switch to buyer home" variant="secondary" onPress={() => switchRole('buyer').then(() => router.replace('/(tabs)/home'))} />
      </View>
    </Screen>
  );
}
