import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { getPaymentGatewayTitle } from '@/features/payments/payment-service';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/theme/marketloop';

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    status?: string;
    gateway?: string;
    productId?: string;
    orderId?: string;
    receipt?: string;
    amount?: string;
    reason?: string;
    cartSource?: string;
  }>();

  const success = params.status === 'success';
  const retryGateway = params.gateway === 'payu'
    ? 'payu'
    : params.gateway === 'phonepe'
      ? 'phonepe'
      : params.gateway === 'cashfree'
        ? 'cashfree'
        : params.gateway === 'hdfc'
          ? 'hdfc'
          : 'razorpay';
  const alternateGateway = retryGateway === 'razorpay'
    ? 'phonepe'
    : retryGateway === 'phonepe'
      ? 'cashfree'
      : retryGateway === 'cashfree'
        ? 'hdfc'
        : retryGateway === 'hdfc'
          ? 'payu'
          : 'razorpay';
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (success && params.cartSource === 'cart') {
      clearCart();
    }
  }, [clearCart, params.cartSource, success]);

  const alternateLabel = useMemo(() => (
    getPaymentGatewayTitle(alternateGateway)
  ), [alternateGateway]);

  return (
    <Screen>
      <View className="gap-4">
        <Card>
          <View className="items-center gap-3">
            <View className={`h-20 w-20 items-center justify-center rounded-full ${success ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <FontAwesome name={success ? 'check' : 'warning'} size={28} color={success ? '#16a34a' : '#e11d48'} />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">{success ? 'Order confirmed' : 'Payment issue'}</Text>
            <Text className="text-center text-3xl font-black text-slate-900">
              {success ? 'Your order is on the way' : 'We need one more try'}
            </Text>
          </View>
          <View className="mt-3">
            <StatusPill label={success ? 'Estimated delivery 10-15 min' : 'Payment failed'} tone={success ? 'success' : 'danger'} />
          </View>
          <Text className="mt-4 text-sm leading-6 text-slate-500">
            {success
              ? `Gateway: ${params.gateway || 'N/A'} - Receipt: ${params.receipt || 'Pending'}`
              : params.reason || 'We were unable to complete the payment session.'}
          </Text>
          {params.amount ? <Text className="mt-2 text-lg font-semibold text-brand-700">Amount: {formatCurrency(Number(params.amount))}</Text> : null}
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">{success ? 'What happens next' : 'How to recover'}</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            {success
              ? 'Your payment has been verified, your order is confirmed, and you can now track it like a normal grocery purchase.'
              : 'Go back to checkout, retry the same gateway, or switch to another payment method without losing the order context.'}
          </Text>
        </Card>

        {success && params.orderId ? <Button label="Track order" onPress={() => router.replace(`/orders/${params.orderId}`)} /> : null}
        {!success && params.productId ? (
          <Button
            label={`Retry with ${getPaymentGatewayTitle(retryGateway)}`}
            onPress={() =>
              router.replace({
                pathname: '/checkout/[productId]',
                params: { productId: String(params.productId), gateway: retryGateway }
              })
            }
          />
        ) : null}
        {!success && params.productId ? (
          <Button
            label={`Switch to ${alternateLabel}`}
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: '/checkout/[productId]',
                params: { productId: String(params.productId), gateway: alternateGateway }
              })
            }
          />
        ) : null}
        <Button label="Open payment history" variant="secondary" onPress={() => router.replace('/payments/history')} />
        <Button label={success ? 'Open invoices' : 'Back to shopping'} variant="secondary" onPress={() => router.replace(success ? '/invoices' : '/(tabs)/home')} />
      </View>
    </Screen>
  );
}
