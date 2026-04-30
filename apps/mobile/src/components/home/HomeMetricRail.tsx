import { ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface HomeMetricRailProps {
  metrics: Array<{ label: string; value: string }>;
}

export const HomeMetricRail = ({ metrics }: HomeMetricRailProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View className="flex-row gap-3 pr-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <Text className="text-xs font-black uppercase tracking-widest text-slate-400">{metric.label}</Text>
          <Text className="mt-3 text-2xl font-black text-slate-900">{metric.value}</Text>
        </Card>
      ))}
    </View>
  </ScrollView>
);
