import { FontAwesome } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { HomeStatChip } from './HomeStatChip';

interface HomeHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
  searchPlaceholder: string;
  searchRoute: string;
  chips: string[];
  dark?: boolean;
  onNavigate: (route: string) => void;
}

export const HomeHero = ({
  eyebrow,
  title,
  subtitle,
  badge,
  searchPlaceholder,
  searchRoute,
  chips,
  dark = true,
  onNavigate
}: HomeHeroProps) => (
  <View className={`rounded-[26px] px-5 py-5 ${dark ? 'bg-brand-500' : 'bg-white'}`}>
    <View className="flex-row items-start justify-between gap-3">
      <View className="flex-1">
        <Text className={`text-xs font-semibold uppercase tracking-[2px] ${dark ? 'text-emerald-100' : 'text-brand-700'}`}>{eyebrow}</Text>
        <Text className={`mt-2 text-3xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</Text>
        <Text className={`mt-2 text-sm leading-6 ${dark ? 'text-emerald-50' : 'text-slate-500'}`}>{subtitle}</Text>
      </View>
      <View className={`rounded-full px-3 py-2 ${dark ? 'bg-white/15' : 'bg-brand-50'}`}>
        <Text className={`text-xs font-bold ${dark ? 'text-white' : 'text-brand-700'}`}>{badge}</Text>
      </View>
    </View>

    <Pressable onPress={() => onNavigate(searchRoute)}>
      <View className={`mt-4 flex-row items-center gap-2 rounded-[18px] px-4 py-3 ${dark ? 'bg-white' : 'border border-slate-200 bg-slate-50'}`}>
        <FontAwesome name="search" size={16} color="#64748b" />
        <Text className="flex-1 text-sm text-slate-500">{searchPlaceholder}</Text>
      </View>
    </Pressable>

    <View className="mt-4 flex-row flex-wrap gap-2">
      {chips.map((chip) => (
        <HomeStatChip key={chip} label={chip} tone={dark ? 'white' : 'light'} />
      ))}
    </View>
  </View>
);
