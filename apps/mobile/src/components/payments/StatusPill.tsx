import { Text, View } from 'react-native';

interface StatusPillProps {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const toneClasses: Record<NonNullable<StatusPillProps['tone']>, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
  neutral: 'bg-slate-100 text-slate-700'
};

export const StatusPill = ({ label, tone = 'neutral' }: StatusPillProps) => (
  <View className={`self-start rounded-full px-3 py-1 ${toneClasses[tone].split(' ')[0]}`}>
    <Text className={`text-xs font-semibold ${toneClasses[tone].split(' ')[1]}`}>{label}</Text>
  </View>
);
