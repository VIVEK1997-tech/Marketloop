import { Text, View } from 'react-native';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MarketplaceProduct, Role } from '@/types/models';
import { formatCurrency } from '@/theme/marketloop';

interface ProductBuyingOptionsCardProps {
  product: MarketplaceProduct;
  quantity: number;
  activeRole?: Role;
  onAddToCart: () => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onBuyNow: () => void;
  loading?: boolean;
}

export const ProductBuyingOptionsCard = ({
  product,
  quantity,
  activeRole,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onBuyNow,
  loading = false
}: ProductBuyingOptionsCardProps) => {
  const effectiveQuantity = Math.max(1, quantity || 1);
  const subtotal = product.price * effectiveQuantity;
  const deliveryFee = subtotal > 699 ? 0 : 35;
  const total = subtotal + deliveryFee;
  const isBuyer = activeRole === 'buyer';

  return (
    <Card>
      <Text className="text-lg font-bold text-slate-900">Buying options</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-500">
        Choose how many you want, review the total, and continue to checkout when you are ready to pick a payment method.
      </Text>

      <View className="mt-4 flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-slate-900">Quantity</Text>
          <Text className="mt-1 text-xs text-slate-500">
            {product.quantity || 1} {product.unit || 'unit'} available per selected item
          </Text>
        </View>
        <QuantityStepper quantity={effectiveQuantity} onIncrease={onIncreaseQuantity} onDecrease={onDecreaseQuantity} />
      </View>

      <View className="mt-4 gap-3 rounded-2xl bg-slate-50 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-slate-500">Item subtotal</Text>
          <Text className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-slate-500">Delivery fee</Text>
          <Text className="text-sm font-semibold text-slate-900">{deliveryFee ? formatCurrency(deliveryFee) : 'FREE'}</Text>
        </View>
        <View className="h-px bg-slate-200" />
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">Estimated total</Text>
          <Text className="text-xl font-black text-brand-700">{formatCurrency(total)}</Text>
        </View>
      </View>

      <View className="mt-4 gap-3">
        {isBuyer ? (
          <>
            <Button label={quantity > 0 ? 'Update cart' : 'Add to cart'} variant="secondary" onPress={onAddToCart} />
            <Button label="Buy now" onPress={onBuyNow} loading={loading} />
            <Text className="text-center text-xs text-slate-500">
              Payment gateway selection happens on the checkout screen so the final charge path always comes from live backend settings.
            </Text>
          </>
        ) : (
          <View className="rounded-2xl bg-amber-50 p-4">
            <Text className="text-sm font-semibold text-amber-800">Buyer mode required</Text>
            <Text className="mt-1 text-sm leading-6 text-amber-700">
              Switch to Buyer mode to proceed with purchase from this product details screen.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};
