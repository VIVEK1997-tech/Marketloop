import { Redirect } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthStore } from '@/store/auth-store';

export default function IndexScreen() {
  const user = useAuthStore((state) => state.user);
  const bootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (bootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <View className="items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand-500">
            <Text className="text-3xl font-black text-white">M</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900">Marketloop</Text>
          <Text className="text-sm text-slate-500">Fresh groceries, fast delivery, trusted sellers.</Text>
          <ActivityIndicator size="small" color="#059669" />
        </View>
      </View>
    );
  }

  if (!user) return <Redirect href="/onboarding" />;
  const activeRole = user.activeRole || user.role;
  return <Redirect href={activeRole === 'admin' ? '/admin-home' : '/(tabs)/home'} />;
}
