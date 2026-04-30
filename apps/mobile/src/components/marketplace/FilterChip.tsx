import { Pressable, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export const FilterChip = ({ label, active = false, onPress }: FilterChipProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    className={`rounded-full border px-4 py-2 ${active ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white'}`}
  >
    <Text className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-slate-600'}`}>{label}</Text>
  </Pressable>
);
