import { Pressable, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { StatusPill } from './StatusPill';

interface PaymentMethodCardProps {
  title: string;
  subtitle: string;
  methods: string;
  selected?: boolean;
  onPress: () => void;
  helperText?: string;
  disabled?: boolean;
}

export const PaymentMethodCard = ({ title, subtitle, methods, selected = false, onPress, helperText, disabled = false }: PaymentMethodCardProps) => (
  <Pressable onPress={onPress} disabled={disabled}>
    <Card className={`${selected ? 'border-brand-500 bg-brand-50' : ''} ${disabled ? 'opacity-60' : ''}`}>
      <View className="gap-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-slate-900">{title}</Text>
            <Text className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</Text>
          </View>
          <StatusPill label={disabled ? 'Unavailable' : selected ? 'Selected' : 'Available'} tone={disabled ? 'neutral' : selected ? 'success' : 'info'} />
        </View>
        <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-400">{methods}</Text>
        <Text className={`text-xs font-semibold ${selected ? 'text-brand-700' : 'text-slate-500'}`}>
          {helperText || (selected ? 'Ready for checkout' : 'Tap to use this gateway')}
        </Text>
      </View>
    </Card>
  </Pressable>
);
