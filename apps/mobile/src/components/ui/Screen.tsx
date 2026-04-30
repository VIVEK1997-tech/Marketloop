import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppMenuButton } from '@/components/navigation/AppMenuButton';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  showMenu?: boolean;
}

export const Screen = ({ children, scroll = true, showMenu = true }: ScreenProps) => {
  const content = (
    <View className="flex-1 bg-slate-50 px-4 py-4">
      {showMenu ? (
        <View className="mb-4 flex-row justify-end">
          <AppMenuButton />
        </View>
      ) : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>{content}</ScrollView> : content}
    </SafeAreaView>
  );
};
