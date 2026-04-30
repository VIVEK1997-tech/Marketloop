import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { AppState, AppStateStatus, Alert, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { FontAwesome } from '@expo/vector-icons';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { getPaymentGatewayTitle } from '@/features/payments/payment-service';
import { paymentRepository } from '@/services/api/payment.repository';
import { getApiErrorMessage } from '@/services/api/client';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/theme/marketloop';

export default function PaymentPendingScreen() {
  const params = useLocalSearchParams<{
    productId?: string;
    gateway?: string;
    gatewayTitle?: string;
    orderId?: string;
    receipt?: string;
    amount?: string;
    provider?: string;
    launchUrl?: string;
    cartSource?: string;
    quantity?: string;
    verify?: string;
    gatewayOrderId?: string;
    mockStatus?: string;
    mockTxnId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }>();
  const clearCart = useCartStore((state) => state.clearCart);
  const [checking, setChecking] = useState(false);
  const [openingGateway, setOpeningGateway] = useState(false);
  const [message, setMessage] = useState('');
  const [autoOpened, setAutoOpened] = useState(false);
  const currentGatewayLabel = params.gatewayTitle || getPaymentGatewayTitle(params.gateway);
  const canOpenGateway = Boolean(params.launchUrl);
  const provider = String(params.provider || '');

  const fallbackMessage = useMemo(() => {
    if (provider === 'redirect-url') {
      return `We created your ${currentGatewayLabel} session. Finish the payment in the external gateway, then come back and confirm status.`;
    }
    if (provider === 'redirect-form' || provider === 'cashfree' || provider === 'razorpay') {
      return `This build created the ${currentGatewayLabel} backend order, but the final mobile handoff still needs a gateway-specific mobile launcher. You can retry with a redirect-friendly gateway or confirm once the backend status updates.`;
    }
    return `We created your ${currentGatewayLabel} payment session. Complete the gateway step, then confirm your payment below.`;
  }, [currentGatewayLabel, provider]);

  const hasRazorpayVerificationPayload = Boolean(
    params.verify === 'razorpay'
    && params.razorpay_order_id
    && params.razorpay_payment_id
    && params.razorpay_signature
    && params.orderId
  );

  const hasHdfcVerificationPayload = Boolean(
    params.verify === 'hdfc'
    && params.orderId
    && params.gatewayOrderId
    && params.mockStatus
  );

  const goToSuccess = (amount?: string | number) => {
    if (params.cartSource === 'cart') clearCart();
    router.replace({
      pathname: '/payments/result',
      params: {
        status: 'success',
        productId: params.productId,
        gateway: params.gateway,
        orderId: params.orderId,
        receipt: params.receipt,
        amount: String(amount || params.amount || ''),
        cartSource: params.cartSource
      }
    });
  };

  const goToFailure = (reason: string) => {
    router.replace({
      pathname: '/payments/result',
      params: {
        status: 'failed',
        productId: params.productId,
        gateway: params.gateway,
        reason
      }
    });
  };

  const verifyReturnedGatewayPayment = async () => {
    if (!hasRazorpayVerificationPayload || !params.orderId) return;
    try {
      setChecking(true);
      setMessage('');
      const verification = await paymentRepository.verifyPayment('razorpay_checkout', String(params.orderId), {
        razorpay_order_id: String(params.razorpay_order_id),
        razorpay_payment_id: String(params.razorpay_payment_id),
        razorpay_signature: String(params.razorpay_signature)
      });
      goToSuccess(verification?.receipt?.amount || verification?.order?.amount || params.amount);
    } catch (error) {
      goToFailure(getApiErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  const verifyReturnedHdfcPayment = async () => {
    if (!hasHdfcVerificationPayload || !params.orderId) return;
    try {
      setChecking(true);
      setMessage('');
      const verification = await paymentRepository.verifyHdfcPayment({
        orderId: String(params.orderId),
        gatewayOrderId: String(params.gatewayOrderId),
        receipt: String(params.receipt || ''),
        mockStatus: String(params.mockStatus || ''),
        mockTxnId: String(params.mockTxnId || '')
      });

      const normalizedStatus = String(verification?.order?.paymentStatus || '').toLowerCase();
      if (normalizedStatus === 'success') {
        goToSuccess(verification?.receipt?.amount || verification?.order?.amount || params.amount);
        return;
      }

      if (normalizedStatus === 'failed') {
        goToFailure(verification?.order?.failureReason || 'The HDFC payment was not completed.');
        return;
      }

      setMessage(`Your ${currentGatewayLabel} payment is still pending. Complete the gateway step first, then check again.`);
    } catch (error) {
      goToFailure(getApiErrorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!params.orderId) return;
    try {
      setChecking(true);
      setMessage('');
      const detail = await paymentRepository.getOrderStatus(String(params.orderId));
      const normalizedStatus = String(detail?.order?.paymentStatus || detail?.status?.status || '').toLowerCase();

      if (['success', 'captured', 'paid', 'authorized'].includes(normalizedStatus)) {
        goToSuccess(detail?.order?.amount);
        return;
      }

      if (['failed', 'cancelled', 'refunded'].includes(normalizedStatus)) {
        goToFailure(detail?.order?.failureReason || 'The payment was not completed.');
        return;
      }

      setMessage(`Your ${currentGatewayLabel} payment is still pending. Complete the gateway step first, then check again.`);
    } catch (error) {
      const apiMessage = getApiErrorMessage(error);
      setMessage(apiMessage);
      Alert.alert('Unable to confirm payment yet', apiMessage);
    } finally {
      setChecking(false);
    }
  };

  const openGateway = async () => {
    if (!params.launchUrl) return;
    try {
      setOpeningGateway(true);
      setMessage('');
      await Linking.openURL(String(params.launchUrl));
    } catch (error) {
      const apiMessage = getApiErrorMessage(error);
      setMessage(apiMessage);
      Alert.alert('Unable to open payment gateway', apiMessage);
    } finally {
      setOpeningGateway(false);
      setAutoOpened(true);
    }
  };

  useEffect(() => {
    if (!canOpenGateway || autoOpened || hasRazorpayVerificationPayload) return;
    openGateway();
  }, [autoOpened, canOpenGateway, hasRazorpayVerificationPayload]);

  useEffect(() => {
    if (hasRazorpayVerificationPayload) {
      verifyReturnedGatewayPayment().catch(() => undefined);
      return undefined;
    }

    if (hasHdfcVerificationPayload) {
      verifyReturnedHdfcPayment().catch(() => undefined);
      return undefined;
    }

    const timer = setTimeout(() => {
      checkPaymentStatus().catch(() => undefined);
    }, 5000);

    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        checkPaymentStatus().catch(() => undefined);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [hasHdfcVerificationPayload, hasRazorpayVerificationPayload, params.orderId]);

  return (
    <Screen>
      <View className="gap-4">
        <Card>
          <View className="items-center gap-3">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-sky-100">
              <FontAwesome name="clock-o" size={28} color="#0284c7" />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">Payment in progress</Text>
            <Text className="text-center text-3xl font-black text-slate-900">
              Complete payment with {currentGatewayLabel}
            </Text>
          </View>
          <View className="mt-3">
            <StatusPill label="Waiting for payment confirmation" tone="info" />
          </View>
          <Text className="mt-4 text-sm leading-6 text-slate-500">
            {message || fallbackMessage}
          </Text>
          {params.amount ? <Text className="mt-2 text-lg font-semibold text-brand-700">Amount: {formatCurrency(Number(params.amount))}</Text> : null}
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">What happens next</Text>
          <View className="mt-4 gap-3">
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <FontAwesome name="check" size={12} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">1. Order reserved</Text>
                <Text className="mt-1 text-sm leading-6 text-slate-500">MarketLoop has created a pending backend order so your item and amount stay consistent.</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-sky-100">
                <FontAwesome name="credit-card" size={12} color="#0284c7" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">2. Complete gateway step</Text>
                <Text className="mt-1 text-sm leading-6 text-slate-500">Use {currentGatewayLabel} to finish the payment securely. The order is not confirmed yet.</Text>
              </View>
            </View>
            <View className="flex-row items-start gap-3">
              <View className="mt-1 h-6 w-6 items-center justify-center rounded-full bg-violet-100">
                <FontAwesome name="refresh" size={12} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-900">3. Confirm payment</Text>
                <Text className="mt-1 text-sm leading-6 text-slate-500">Once the backend verifies the charge, we move you to the order confirmation screen automatically.</Text>
              </View>
            </View>
          </View>
        </Card>

        {canOpenGateway ? (
          <Button
            label={openingGateway ? `Opening ${currentGatewayLabel}...` : `Open ${currentGatewayLabel}`}
            onPress={openGateway}
            disabled={openingGateway}
            loading={openingGateway}
          />
        ) : null}
        <Button
          label={checking ? 'Checking payment...' : 'I completed payment'}
          variant={canOpenGateway ? 'secondary' : 'primary'}
          onPress={checkPaymentStatus}
          disabled={checking}
          loading={checking}
        />
        <Button
          label={`Retry with ${currentGatewayLabel}`}
          onPress={() =>
            router.replace({
              pathname: '/checkout/[productId]',
              params: { productId: String(params.productId), gateway: params.gateway }
            })
          }
        />
        <Button
          label={`Switch gateway`}
          variant="secondary"
          onPress={() =>
            router.replace({
              pathname: '/checkout/[productId]',
              params: { productId: String(params.productId) }
            })
          }
        />
        <Button label="Open payment history" variant="secondary" onPress={() => router.replace('/payments/history')} />
        <Button label="Back to shopping" variant="secondary" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    </Screen>
  );
}
