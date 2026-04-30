import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
}

export const Button = ({ label, onPress, variant = 'primary', disabled, loading = false }: ButtonProps) => (
  <Pressable
    disabled={disabled || loading}
    onPress={onPress}
    className={`items-center rounded-2xl px-4 py-4 ${
      variant === 'primary'
        ? 'bg-brand-500 shadow-sm'
        : 'border border-slate-200 bg-white'
    } ${disabled || loading ? 'opacity-60' : ''}`}
  >
    <View className="flex-row items-center gap-2">
      {loading ? <ActivityIndicator size="small" color={variant === 'primary' ? '#ffffff' : '#16a34a'} /> : null}
      <Text className={`font-semibold ${variant === 'primary' ? 'text-white' : 'text-slate-700'}`}>{label}</Text>
    </View>
  </Pressable>
);
