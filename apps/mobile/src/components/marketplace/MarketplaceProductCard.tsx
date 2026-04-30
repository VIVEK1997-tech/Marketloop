import { FontAwesome } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Card } from '@/components/ui/Card';
import { MarketplaceProduct } from '@/types/models';
import { formatCurrency, getProductDiscount, getProductSubtitle } from '@/theme/marketloop';

interface MarketplaceProductCardProps {
  product: MarketplaceProduct;
  saved?: boolean;
  compact?: boolean;
  quantity?: number;
  onPress: () => void;
  onAddToCart?: () => void;
  onIncreaseQuantity?: () => void;
  onDecreaseQuantity?: () => void;
  onToggleWishlist?: () => void;
}

export const MarketplaceProductCard = ({
  product,
  saved = false,
  compact = false,
  quantity = 0,
  onPress,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onToggleWishlist
}: MarketplaceProductCardProps) => (
  (() => {
    const { discount, originalPrice } = getProductDiscount(product._id, product.price);
    const recommendationReasons =
      'recommendationReasons' in product && Array.isArray((product as MarketplaceProduct & { recommendationReasons?: string[] }).recommendationReasons)
        ? (product as MarketplaceProduct & { recommendationReasons?: string[] }).recommendationReasons?.slice(0, 2) || []
        : [];

    return (
      <Pressable onPress={onPress}>
        <Card>
          <View className={`${compact ? 'flex-row gap-3' : 'gap-4'}`}>
            <View className={`${compact ? 'w-[108px]' : 'w-full'} relative`}>
              {product.images?.[0] ? (
                <Image
                  source={{ uri: product.images[0] }}
                  className={`${compact ? 'h-28' : 'h-44'} w-full rounded-[18px] bg-slate-100`}
                />
              ) : (
                <View className={`${compact ? 'h-28' : 'h-44'} w-full items-center justify-center rounded-[18px] bg-slate-100`}>
                  <FontAwesome name="shopping-basket" size={26} color="#94a3b8" />
                </View>
              )}
              <View className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-1">
                <Text className="text-[10px] font-black text-white">{discount}% OFF</Text>
              </View>
              {onToggleWishlist ? (
                <Pressable onPress={onToggleWishlist} className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-white/90">
                  <FontAwesome name={saved ? 'heart' : 'heart-o'} size={16} color={saved ? '#ef4444' : '#475569'} />
                </Pressable>
              ) : null}
            </View>

            <View className="flex-1 gap-2">
              <View>
                <Text className="text-base font-bold text-slate-900" numberOfLines={2}>{product.title}</Text>
                <Text className="mt-1 text-xs text-slate-500">{getProductSubtitle(product.quantity, product.unit)} • {product.location}</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-black text-slate-900">{formatCurrency(product.price)}</Text>
                <Text className="text-xs text-slate-400 line-through">{formatCurrency(originalPrice)}</Text>
              </View>

              {product.normalizedPricePerKg ? (
                <Text className="text-xs text-slate-500">{formatCurrency(product.normalizedPricePerKg)} per Kg equivalent</Text>
              ) : null}

              {product.seller?.name ? (
                <View className="flex-row items-center gap-2">
                  <FontAwesome name="shopping-basket" size={12} color="#64748b" />
                  <Text className="text-xs text-slate-500">{product.seller.name}</Text>
                </View>
              ) : null}

              {recommendationReasons.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {recommendationReasons.map((reason) => (
                    <View key={reason} className="rounded-full bg-slate-100 px-2 py-1">
                      <Text className="text-[11px] font-medium text-slate-600">{reason}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <View className="mt-1 flex-row items-center justify-between">
                <View className="rounded-full bg-emerald-50 px-3 py-1">
                  <Text className="text-[11px] font-semibold text-emerald-700">{product.category}</Text>
                </View>
                {quantity > 0 && onIncreaseQuantity && onDecreaseQuantity ? (
                  <QuantityStepper quantity={quantity} onIncrease={onIncreaseQuantity} onDecrease={onDecreaseQuantity} />
                ) : onAddToCart ? (
                  <Pressable onPress={onAddToCart} className="rounded-full bg-brand-500 px-4 py-2">
                    <Text className="text-xs font-bold text-white">Add</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  })()
);
