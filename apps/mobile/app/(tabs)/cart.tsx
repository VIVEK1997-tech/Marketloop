import { router } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency, getProductDiscount } from '@/theme/marketloop';

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 699 ? 0 : items.length ? 35 : 0;
  const total = subtotal + deliveryFee;

  if (!items.length) {
    return (
      <Screen>
        <View className="gap-5">
          <EmptyState title="Your cart is waiting" description="Add fresh groceries from Home or Categories and we’ll keep the total visible here at every step." />
          <Button label="Start shopping" onPress={() => router.replace('/(tabs)/home')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false}>
      <View className="flex-1">
        <View className="gap-4">
          <Text className="text-3xl font-black text-slate-900">Cart</Text>
          <Text className="text-sm text-slate-500">Review items, adjust quantity, and keep pricing clear before checkout.</Text>
        </View>

        <View className="mt-4 flex-1 gap-3">
          {items.map((item) => {
            const { discount } = getProductDiscount(item.product._id, item.product.price);
            return (
              <Card key={item.product._id}>
                <View className="flex-row gap-3">
                  {item.product.images?.[0] ? (
                    <Image source={{ uri: item.product.images[0] }} className="h-24 w-24 rounded-[18px] bg-slate-100" />
                  ) : (
                    <View className="h-24 w-24 rounded-[18px] bg-slate-100" />
                  )}
                  <View className="flex-1 gap-2">
                    <Text className="text-base font-bold text-slate-900" numberOfLines={2}>{item.product.title}</Text>
                    <Text className="text-xs text-slate-500">{item.product.quantity || 1} {item.product.unit || 'unit'} • {item.product.location}</Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-black text-slate-900">{formatCurrency(item.product.price * item.quantity)}</Text>
                      <View className="rounded-full bg-amber-100 px-2 py-1">
                        <Text className="text-[10px] font-bold text-amber-700">{discount}% OFF</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrease={() => incrementItem(item.product._id)}
                        onDecrease={() => decrementItem(item.product._id)}
                      />
                      <Text className="text-xs font-semibold text-emerald-700">Fresh stock available</Text>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Bill summary</Text>
          <View className="mt-4 gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Subtotal</Text>
              <Text className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Delivery fee</Text>
              <Text className="text-sm font-semibold text-slate-900">{deliveryFee ? formatCurrency(deliveryFee) : 'FREE'}</Text>
            </View>
            <View className="h-px bg-slate-200" />
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900">Total</Text>
              <Text className="text-xl font-black text-brand-700">{formatCurrency(total)}</Text>
            </View>
          </View>
        </Card>

        <View className="mt-4 gap-3 pb-2">
          <Button label="Proceed to checkout" onPress={() => router.push('/checkout/cart' as never)} />
          <Button label="Clear cart" variant="secondary" onPress={clearCart} />
        </View>
      </View>
    </Screen>
  );
}
