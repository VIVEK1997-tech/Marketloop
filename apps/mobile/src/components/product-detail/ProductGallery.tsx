import { Image, ScrollView, Text, View } from 'react-native';

interface ProductGalleryProps {
  images?: string[];
}

export const ProductGallery = ({ images = [] }: ProductGalleryProps) => {
  if (!images.length) {
    return (
      <View className="h-72 w-full items-center justify-center rounded-[24px] bg-slate-100">
        <Text className="text-sm text-slate-400">No product image available</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pr-4">
          {images.map((image, index) => (
            <Image key={`${image}-${index}`} source={{ uri: image }} className="h-72 w-80 rounded-[24px] bg-slate-100" />
          ))}
        </View>
      </ScrollView>
      <View className="flex-row justify-center gap-2">
        {images.map((image, index) => (
          <View key={`${image}-${index}-dot`} className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-brand-500' : 'bg-slate-300'}`} />
        ))}
      </View>
    </View>
  );
};
