import { Pressable, Text, View } from 'react-native';

interface QuantityStepperProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}

export const QuantityStepper = ({ quantity, onDecrease, onIncrease }: QuantityStepperProps) => (
  <View className="flex-row items-center rounded-full border border-slate-200 bg-white p-1">
    <Pressable onPress={onDecrease} className="h-9 w-9 items-center justify-center rounded-full bg-slate-100">
      <Text className="text-lg font-bold text-slate-700">-</Text>
    </Pressable>
    <Text className="min-w-[36px] text-center text-sm font-bold text-slate-900">{quantity}</Text>
    <Pressable onPress={onIncrease} className="h-9 w-9 items-center justify-center rounded-full bg-brand-500">
      <Text className="text-lg font-bold text-white">+</Text>
    </Pressable>
  </View>
);
