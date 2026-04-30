import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-3xl font-black text-slate-900">Page not found</Text>
        <Text className="text-center text-base text-slate-500">
          This screen is not available in the current MarketLoop mobile build.
        </Text>
        <Button label="Back to dashboard" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
