import { FontAwesome } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { MarketplaceProduct } from '@/types/models';
import { formatCurrency, getProductDiscount, getProductSubtitle } from '@/theme/marketloop';

interface HomeProductRailCardProps {
  product: MarketplaceProduct;
  saved?: boolean;
  quantity?: number;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncreaseQuantity?: () => void;
  onDecreaseQuantity?: () => void;
  onToggleWishlist?: () => void;
}

export const HomeProductRailCard = ({
  product,
  saved = false,
  quantity = 0,
  onPress,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onToggleWishlist
}: HomeProductRailCardProps) => {
  const { discount, originalPrice } = getProductDiscount(product._id, product.price);

  return (
    <Pressable onPress={onPress} className="w-[176px] rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
      <View className="relative">
        {product.images?.[0] ? (
          <Image source={{ uri: product.images[0] }} className="h-28 w-full rounded-[18px] bg-slate-100" />
        ) : (
          <View className="h-28 w-full items-center justify-center rounded-[18px] bg-slate-100">
            <FontAwesome name="shopping-basket" size={24} color="#94a3b8" />
          </View>
        )}
        <View className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-1">
          <Text className="text-[10px] font-black text-white">{discount}% OFF</Text>
        </View>
        {onToggleWishlist ? (
          <Pressable onPress={onToggleWishlist} className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white/90">
            <FontAwesome name={saved ? 'heart' : 'heart-o'} size={14} color={saved ? '#ef4444' : '#475569'} />
          </Pressable>
        ) : null}
      </View>

      <View className="mt-3 gap-1">
        <Text className="text-sm font-bold text-slate-900" numberOfLines={2}>{product.title}</Text>
        <Text className="text-[11px] text-slate-500">{getProductSubtitle(product.quantity, product.unit)}</Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text className="text-base font-black text-slate-900">{formatCurrency(product.price)}</Text>
          <Text className="text-[11px] text-slate-400 line-through">{formatCurrency(originalPrice)}</Text>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <View className="rounded-full bg-emerald-50 px-2 py-1">
          <Text className="text-[10px] font-semibold text-emerald-700">{product.category}</Text>
        </View>
        {quantity > 0 && onIncreaseQuantity && onDecreaseQuantity ? (
          <View className="flex-row items-center rounded-full bg-brand-500 px-2 py-1">
            <Pressable onPress={onDecreaseQuantity} className="px-2 py-1">
              <Text className="text-xs font-bold text-white">-</Text>
            </Pressable>
            <Text className="px-1 text-xs font-bold text-white">{quantity}</Text>
            <Pressable onPress={onIncreaseQuantity} className="px-2 py-1">
              <Text className="text-xs font-bold text-white">+</Text>
            </Pressable>
          </View>
        ) : onAddToCart ? (
          <Pressable onPress={onAddToCart} className="rounded-full border border-brand-500 px-3 py-1.5">
            <Text className="text-xs font-bold text-brand-700">ADD</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
};
