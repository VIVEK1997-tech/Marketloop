import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

export const ProductQualityCard = () => (
  <Card>
    <Text className="text-lg font-bold text-slate-900">Nutritional & quality info</Text>
    <View className="mt-4 flex-row flex-wrap gap-2">
      <View className="rounded-full bg-emerald-50 px-3 py-2"><Text className="text-xs font-semibold text-emerald-700">Farm fresh</Text></View>
      <View className="rounded-full bg-sky-50 px-3 py-2"><Text className="text-xs font-semibold text-sky-700">Quality checked</Text></View>
      <View className="rounded-full bg-amber-50 px-3 py-2"><Text className="text-xs font-semibold text-amber-700">Fast delivery</Text></View>
    </View>
  </Card>
);
