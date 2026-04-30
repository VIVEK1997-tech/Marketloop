import { FontAwesome } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';

interface ShortcutItem {
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

interface HomeShortcutRailProps {
  items: readonly ShortcutItem[];
  onNavigate: (route: string) => void;
}

export const HomeShortcutRail = ({ items, onNavigate }: HomeShortcutRailProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View className="flex-row gap-3 pr-4">
      {items.map((item) => (
        <Pressable key={item.title} onPress={() => onNavigate(item.route)} className="w-[170px]">
          <Card>
            <View className="gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                <FontAwesome name={item.icon as never} size={18} color="#16a34a" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-900">{item.title}</Text>
                <Text className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </View>
  </ScrollView>
);
