import { Pressable, Text } from 'react-native';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  onPress?: () => void;
}

export const StatCard = ({ label, value, onPress }: StatCardProps) => {
  const content = (
    <Card>
      <Text className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</Text>
      <Text className="mt-3 text-2xl font-black text-slate-900">{value}</Text>
    </Card>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
};
