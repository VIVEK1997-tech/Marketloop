import { Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <View className="gap-1">
    <Text className="text-2xl font-black text-slate-900">{title}</Text>
    {subtitle ? <Text className="text-sm text-slate-500">{subtitle}</Text> : null}
  </View>
);
