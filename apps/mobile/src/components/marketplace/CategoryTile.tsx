import { FontAwesome } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { CATEGORY_META } from '@/theme/marketloop';

interface CategoryTileProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export const CategoryTile = ({ label, active = false, onPress }: CategoryTileProps) => {
  const meta = CATEGORY_META[label] || { icon: 'shopping-bag', tint: '#F1F5F9' };

  return (
    <Pressable onPress={onPress} className={`w-[88px] rounded-[20px] border px-3 py-4 ${active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}`}>
      <View className="items-center gap-3">
        <View style={{ backgroundColor: meta.tint }} className="h-12 w-12 items-center justify-center rounded-2xl">
          <FontAwesome name={meta.icon as never} size={20} color="#0f172a" />
        </View>
        <Text className={`text-center text-xs font-semibold ${active ? 'text-brand-700' : 'text-slate-700'}`}>{label}</Text>
      </View>
    </Pressable>
  );
};
