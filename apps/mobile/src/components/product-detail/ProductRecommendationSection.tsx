import { ScrollView, Text, View } from 'react-native';
import { HomeProductRailCard } from '@/components/marketplace/HomeProductRailCard';
import { MarketplaceProduct } from '@/types/models';

interface ProductRecommendationSectionProps {
  items: MarketplaceProduct[];
  savedIds: Set<string>;
  getQuantity: (productId: string) => number;
  onOpenProduct: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MarketplaceProduct) => void;
  onIncreaseQuantity: (productId: string) => void;
  onDecreaseQuantity: (productId: string) => void;
}

export const ProductRecommendationSection = ({
  items,
  savedIds,
  getQuantity,
  onOpenProduct,
  onToggleWishlist,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity
}: ProductRecommendationSectionProps) => {
  if (!items.length) return null;

  return (
    <View className="gap-3">
      <Text className="text-xl font-black text-slate-900">You may also like</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pr-4">
          {items.map((item) => (
            <HomeProductRailCard
              key={item._id}
              product={item}
              saved={savedIds.has(item._id)}
              quantity={getQuantity(item._id)}
              onPress={() => onOpenProduct(item._id)}
              onToggleWishlist={() => onToggleWishlist(item._id)}
              onAddToCart={() => onAddToCart(item)}
              onIncreaseQuantity={() => onIncreaseQuantity(item._id)}
              onDecreaseQuantity={() => onDecreaseQuantity(item._id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
