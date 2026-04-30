import { Text, View } from 'react-native';

interface HomeStatChipProps {
  label: string;
  tone?: 'light' | 'white';
}

export const HomeStatChip = ({ label, tone = 'light' }: HomeStatChipProps) => (
  <View className={`rounded-full px-3 py-2 ${tone === 'white' ? 'bg-white/15' : 'bg-emerald-50'}`}>
    <Text className={`text-xs font-semibold ${tone === 'white' ? 'text-white' : 'text-emerald-700'}`}>{label}</Text>
  </View>
);
