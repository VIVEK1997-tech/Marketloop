import { View, Text } from 'react-native';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';

interface ProductStickyActionsProps {
  quantity: number;
  onAddToCart: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onBuyNow: () => void;
  onToggleWishlist: () => void;
  saved: boolean;
}

export const ProductStickyActions = ({
  quantity,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onBuyNow,
  onToggleWishlist,
  saved
}: ProductStickyActionsProps) => (
  <View className="border-t border-slate-200 bg-slate-50 pt-3">
    <View className="mb-3 flex-row items-center justify-between">
      <View>
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400">Cart status</Text>
        <Text className="mt-1 text-sm font-bold text-slate-900">{quantity ? `${quantity} item${quantity === 1 ? '' : 's'} in cart` : 'Not added yet'}</Text>
        <Text className="mt-1 text-xs text-slate-500">Choose your payment method later in checkout from the gateways currently enabled by MarketLoop.</Text>
      </View>
      {quantity > 0 ? (
        <QuantityStepper quantity={quantity} onIncrease={onIncreaseQuantity} onDecrease={onDecreaseQuantity} />
      ) : (
        <Button label="Add to cart" onPress={onAddToCart} />
      )}
    </View>
    <View className="gap-3">
      <Button label="Buy now" onPress={onBuyNow} />
      <Button label={saved ? 'Remove from wishlist' : 'Save to wishlist'} variant="secondary" onPress={onToggleWishlist} />
    </View>
  </View>
);
