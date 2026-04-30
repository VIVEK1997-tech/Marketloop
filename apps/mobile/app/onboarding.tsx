import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';

export default function OnboardingScreen() {
  return (
    <Screen>
      <View className="flex-1 justify-between">
        <View className="mt-8 gap-5">
          <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand-500">
            <Text className="text-3xl font-black text-white">M</Text>
          </View>
          <View>
            <Text className="text-sm font-black uppercase tracking-widest text-brand-700">MarketLoop Mobile</Text>
            <Text className="mt-4 text-4xl font-black text-slate-900">Groceries, fresh produce, and trusted sellers in one clean flow.</Text>
            <Text className="mt-4 text-base leading-7 text-slate-500">
              Shop fruits, vegetables, dairy, staples, and quick daily needs with clear pricing, fast checkout, and real seller conversations.
            </Text>
          </View>

          <Card>
            <View className="gap-3">
              <Text className="text-lg font-bold text-slate-900">Why Marketloop works</Text>
              <Text className="text-sm text-slate-500">10-minute delivery style UX</Text>
              <Text className="text-sm text-slate-500">Freshness-first marketplace listings</Text>
              <Text className="text-sm text-slate-500">Payments, invoices, and order tracking built in</Text>
            </View>
          </Card>
        </View>
        <View className="gap-3 pb-8">
          <Button label="Continue with phone or email" onPress={() => router.push('/login')} />
          <Button label="Create account" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      </View>
    </Screen>
  );
}
