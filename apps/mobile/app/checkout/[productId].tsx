import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { PaymentMethodCard } from '@/components/payments/PaymentMethodCard';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { getPaymentGatewayTitle, paymentService, PaymentGateway, toPaymentGatewayId } from '@/features/payments/payment-service';
import { getApiErrorMessage } from '@/services/api/client';
import { marketplaceRepository } from '@/services/api/marketplace.repository';
import { paymentRepository } from '@/services/api/payment.repository';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/theme/marketloop';

const gateways: Array<{
  key: PaymentGateway;
  title: string;
  subtitle: string;
  methods: string;
}> = [
  {
    key: 'razorpay',
    title: 'Razorpay',
    subtitle: 'Good for cards, UPI, wallets, and a fast buyer checkout experience.',
    methods: 'Cards / UPI / Wallets / Net Banking'
  },
  {
    key: 'payu',
    title: 'PayU',
    subtitle: 'Useful fallback gateway for UPI, net banking, and card-based payments.',
    methods: 'UPI / Cards / Net Banking'
  },
  {
    key: 'phonepe',
    title: 'PhonePe',
    subtitle: 'Best when you want a redirect-based mobile handoff for UPI and wallet flows.',
    methods: 'UPI / Cards / Wallets / Net Banking'
  },
  {
    key: 'cashfree',
    title: 'Cashfree',
    subtitle: 'Hosted payment session with flexible gateway routing and a clean return flow.',
    methods: 'UPI / Cards / Net Banking'
  },
  {
    key: 'hdfc',
    title: 'HDFC SmartGateway',
    subtitle: 'Sandbox-ready redirect checkout that mirrors the web payment status verification flow.',
    methods: 'Cards / UPI / Net Banking'
  }
];

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ productId: string; gateway?: PaymentGateway }>();
  const productId = params.productId;
  const [gateway, setGateway] = useState<PaymentGateway>(
    params.gateway === 'payu'
      ? 'payu'
        : params.gateway === 'phonepe'
          ? 'phonepe'
        : params.gateway === 'cashfree'
          ? 'cashfree'
        : params.gateway === 'hdfc'
          ? 'hdfc'
          : 'razorpay'
  );
  const [loading, setLoading] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const { data: product } = useQuery({
    queryKey: ['product', productId, 'checkout'],
    queryFn: () => marketplaceRepository.getProduct(String(productId)),
    enabled: !!productId && productId !== 'cart'
  });

  const { data: gatewayConfig, isLoading: loadingGateways } = useQuery({
    queryKey: ['checkout-gateways'],
    queryFn: paymentRepository.getCheckoutGateways
  });

  const gatewayAvailability = useMemo(() => {
    const statusById = new Map((gatewayConfig?.gateways || []).map((item) => [item.id, item]));
    return gateways.map((item) => {
      const backendGateway = statusById.get(toPaymentGatewayId(item.key));
      return {
        ...item,
        backendGateway,
        available: Boolean(backendGateway?.enabled && backendGateway?.status !== 'unavailable')
      };
    });
  }, [gatewayConfig]);

  useEffect(() => {
    const selected = gatewayAvailability.find((item) => item.key === gateway);
    const firstAvailable = gatewayAvailability.find((item) => item.available);
    if (firstAvailable && selected && !selected.available) {
      setGateway(firstAvailable.key);
    }
  }, [gateway, gatewayAvailability]);

  const selectedGateway = useMemo(() => gatewayAvailability.find((item) => item.key === gateway) || gatewayAvailability[0], [gateway, gatewayAvailability]);
  const alternateGateway = useMemo(() => gatewayAvailability.find((item) => item.key !== gateway && item.available)?.key, [gateway, gatewayAvailability]);
  const checkoutItems = productId === 'cart'
    ? cartItems
    : product
      ? [{ product, quantity: Math.max(1, useCartStore.getState().getQuantity(product._id) || 1) }]
      : [];
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 699 ? 0 : checkoutItems.length ? 35 : 0;
  const total = subtotal + deliveryFee;

  const startPayment = async () => {
    try {
      setLoading(true);
      const targetProductId = productId === 'cart' ? checkoutItems[0]?.product._id : String(productId);
      const targetQuantity = productId === 'cart' ? checkoutItems[0]?.quantity || 1 : Math.max(1, useCartStore.getState().getQuantity(String(targetProductId)) || 1);
      if (!targetProductId) throw new Error('No product is available for checkout.');
      if (!selectedGateway?.available) throw new Error(`${selectedGateway?.title || 'This payment gateway'} is not enabled right now. Please choose an available gateway.`);
      const session = await paymentService.createSession(String(targetProductId), gateway, targetQuantity);
      router.push({
        pathname: '/payments/pending',
        params: {
          productId: String(targetProductId),
          gateway,
          gatewayTitle: selectedGateway.title,
          orderId: String(session.order.id),
          receipt: String(session.order.receipt),
          amount: String(total || session.order.amount),
          provider: String(session.checkout?.provider || ''),
          launchUrl: String(session.checkout?.launchUrl || session.checkout?.url || session.checkout?.paymentUrl || ''),
          cartSource: productId === 'cart' ? 'cart' : 'single',
          quantity: String(targetQuantity)
        }
      });
    } catch (error) {
      const message = getApiErrorMessage(error);
      Alert.alert('Payment setup failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="gap-4">
        <Card>
          <Text className="text-2xl font-black text-slate-900">Checkout</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">Confirm address, delivery timing, and payment method before placing your order.</Text>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Delivery address</Text>
          <Text className="mt-3 text-sm text-slate-800">Home - MarketLoop buyer address</Text>
          <Text className="mt-1 text-sm leading-6 text-slate-500">Fresh groceries will be delivered to your saved address. Address selection can be expanded in the next pass.</Text>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Delivery slot</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <StatusPill label="10-15 min" tone="success" />
            <StatusPill label="Express slot" tone="info" />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Order summary</Text>
          <View className="mt-4 gap-3">
            {checkoutItems.map((item) => (
              <View key={item.product._id} className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-slate-900">{item.product.title}</Text>
                  <Text className="mt-1 text-xs text-slate-500">{item.quantity} x {formatCurrency(item.product.price)}</Text>
                </View>
                <Text className="text-sm font-bold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</Text>
              </View>
            ))}
            <View className="h-px bg-slate-200" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Subtotal</Text>
              <Text className="text-sm font-semibold text-slate-900">{formatCurrency(subtotal)}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-500">Delivery</Text>
              <Text className="text-sm font-semibold text-slate-900">{deliveryFee ? formatCurrency(deliveryFee) : 'FREE'}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-slate-900">Total</Text>
              <Text className="text-xl font-black text-brand-700">{formatCurrency(total)}</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View className="gap-2">
            <Text className="text-2xl font-black text-slate-900">Choose payment gateway</Text>
            <Text className="text-sm leading-6 text-slate-500">
              Pick the fastest path for UPI, cards, or wallets. The current mobile build creates a live backend payment session first.
            </Text>
            <StatusPill label={`Selected: ${selectedGateway.title}`} tone="info" />
            <Text className="text-xs leading-5 text-slate-500">
              Switching here updates the backend session request before Marketloop creates the order.
            </Text>
            {loadingGateways ? <StatusPill label="Checking gateways" tone="neutral" /> : null}
          </View>
        </Card>

        {gatewayAvailability.map((item) => (
          <PaymentMethodCard
            key={item.key}
            title={item.title}
            subtitle={item.subtitle}
            methods={item.methods}
            selected={gateway === item.key}
            onPress={() => item.available && setGateway(item.key)}
            disabled={!item.available}
            helperText={
              item.available
                ? item.key === gateway
                  ? 'This gateway will be used for order creation'
                  : 'Tap to switch to this gateway'
                : item.backendGateway?.configReasons?.[0] || 'This gateway is not enabled by the backend configuration'
            }
          />
        ))}

        <Card>
          <Text className="text-sm text-slate-500">Payment options</Text>
          <Text className="mt-2 text-base leading-6 text-slate-700">UPI, cards, net banking, COD readiness, and payment history are all designed to stay visible and familiar across the flow.</Text>
        </Card>

        <Button label={`Continue to ${selectedGateway.title}`} onPress={startPayment} disabled={loading || loadingGateways || !checkoutItems.length || !selectedGateway?.available} loading={loading} />
        {alternateGateway ? (
          <Button
            label={`Try ${getPaymentGatewayTitle(alternateGateway)} instead`}
            variant="secondary"
            onPress={() => setGateway(alternateGateway)}
            disabled={loading || !checkoutItems.length}
          />
        ) : null}
      </View>
    </Screen>
  );
}
