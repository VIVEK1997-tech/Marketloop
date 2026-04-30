import { ScrollView, View } from 'react-native';
import { CategoryTile } from '@/components/marketplace/CategoryTile';

interface HomeCategoryRailProps {
  categories: string[];
  onNavigate: (category: string) => void;
}

export const HomeCategoryRail = ({ categories, onNavigate }: HomeCategoryRailProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View className="flex-row gap-3 pr-4">
      {categories.map((category) => (
        <CategoryTile key={category} label={category} onPress={() => onNavigate(category)} />
      ))}
    </View>
  </ScrollView>
);
