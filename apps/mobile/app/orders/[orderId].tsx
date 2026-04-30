import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { paymentRepository } from '@/services/api/payment.repository';

const getTone = (value?: string) => {
  const normalized = String(value || '').toLowerCase();
  if (['success', 'paid', 'captured', 'processing'].includes(normalized)) return 'success' as const;
  if (['pending', 'awaiting_payment'].includes(normalized)) return 'warning' as const;
  if (['failed', 'cancelled'].includes(normalized)) return 'danger' as const;
  return 'neutral' as const;
};

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => paymentRepository.getOrderDetail(String(orderId)),
    enabled: !!orderId
  });

  if (!data?.order) {
    return (
      <Screen>
        <Text className="text-base text-slate-500">Loading order...</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-4">
        <Card>
          <Text className="text-xs font-semibold uppercase tracking-[2px] text-slate-400">Order detail</Text>
          <Text className="mt-2 text-2xl font-black text-slate-900">{data.order.product?.title || 'Order detail'}</Text>
          <Text className="mt-2 text-sm text-slate-500">Order created {data.order.createdAt ? new Date(data.order.createdAt).toLocaleString() : 'recently'}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <StatusPill label={`Payment: ${data.order.paymentStatus}`} tone={getTone(data.order.paymentStatus)} />
            <StatusPill label={`Delivery: ${data.order.tracking?.deliveryStatus || 'pending'}`} tone={getTone(data.order.tracking?.deliveryStatus)} />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Payment summary</Text>
          <Text className="mt-3 text-sm text-slate-500">Amount: Rs. {Number(data.order.amount || 0).toLocaleString('en-IN')}</Text>
          <Text className="mt-1 text-sm text-slate-500">Currency: {data.order.currency || 'INR'}</Text>
          <Text className="mt-1 text-sm text-slate-500">Method: {data.payment?.method || data.payment?.paymentGateway || 'Awaiting verification'}</Text>
          <Text className="mt-1 text-sm text-slate-500">Gateway: {data.payment?.paymentGateway || 'Pending'}</Text>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Tracking</Text>
          <Text className="mt-3 text-sm text-slate-500">Status: {data.order.tracking?.deliveryStatus || 'Awaiting payment'}</Text>
          <Text className="mt-1 text-sm text-slate-500">
            Estimated delivery: {data.order.tracking?.estimatedDelivery ? new Date(data.order.tracking.estimatedDelivery).toLocaleDateString() : 'Will appear after payment'}
          </Text>
        </Card>

        {data.order.invoice ? <Button label="Open invoice" onPress={() => router.push(`/invoices/${data.order.invoice?.invoiceNumber}`)} /> : null}
        <Button label="Back to payments" variant="secondary" onPress={() => router.replace('/payments/history')} />
      </View>
    </Screen>
  );
}
