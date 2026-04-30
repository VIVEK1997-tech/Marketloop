import { Text, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState = ({ title, description }: EmptyStateProps) => (
  <View className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-8">
    <Text className="text-lg font-bold text-slate-900">{title}</Text>
    <Text className="mt-2 text-sm text-slate-500">{description}</Text>
  </View>
);
