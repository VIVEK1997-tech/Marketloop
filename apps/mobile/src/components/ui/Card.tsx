import { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface CardProps extends PropsWithChildren {
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <View className={`rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm ${className}`.trim()}>{children}</View>
);
