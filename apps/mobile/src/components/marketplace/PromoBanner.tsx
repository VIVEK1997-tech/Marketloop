import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface PromoBannerProps {
  title: string;
  subtitle: string;
  badge: string;
}

export const PromoBanner = ({ title, subtitle, badge }: PromoBannerProps) => (
  <Card>
    <View className="gap-3">
      <View className="self-start rounded-full bg-amber-100 px-3 py-1">
        <Text className="text-xs font-bold uppercase tracking-wide text-amber-700">{badge}</Text>
      </View>
      <Text className="text-2xl font-black text-slate-900">{title}</Text>
      <Text className="text-sm leading-6 text-slate-500">{subtitle}</Text>
      <View className="flex-row items-center gap-2">
        <FontAwesome name="clock-o" size={14} color="#16a34a" />
        <Text className="text-sm font-semibold text-brand-700">Delivery slots from 10 minutes</Text>
      </View>
    </View>
  </Card>
);
