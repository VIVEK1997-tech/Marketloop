import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { paymentRepository } from '@/services/api/payment.repository';

const getPaymentTone = (status?: string) => {
  const normalized = String(status || '').toLowerCase();
  if (['success', 'paid', 'captured'].includes(normalized)) return 'success' as const;
  if (['pending', 'processing'].includes(normalized)) return 'warning' as const;
  if (['failed', 'cancelled'].includes(normalized)) return 'danger' as const;
  return 'neutral' as const;
};

export default function PaymentHistoryScreen() {
  const { data: orders = [] } = useQuery({
    queryKey: ['payments-history'],
    queryFn: paymentRepository.getOrders
  });

  const successfulOrders = orders.filter((order) => String(order.paymentStatus).toLowerCase() === 'success');
  const pendingOrders = orders.filter((order) => String(order.paymentStatus).toLowerCase() === 'pending');
  const totalPaid = successfulOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Payment history" subtitle="Track recent payment sessions, receipts, and linked invoices." />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[48%] flex-1">
            <StatCard label="Successful" value={String(successfulOrders.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Pending" value={String(pendingOrders.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Paid total" value={`Rs. ${totalPaid.toLocaleString('en-IN')}`} />
          </View>
        </View>

        {!orders.length ? (
          <EmptyState title="No payments yet" description="Completed and pending purchases will appear here once you start checkout from the marketplace." />
        ) : (
          orders.map((order) => (
            <Pressable key={order._id} onPress={() => router.push(`/orders/${order._id}`)}>
              <Card>
                <View className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">{order.product?.title || 'Order'}</Text>
                      <Text className="mt-1 text-sm text-slate-500">Created {new Date(order.createdAt).toLocaleString()}</Text>
                    </View>
                    <StatusPill label={order.paymentStatus} tone={getPaymentTone(order.paymentStatus)} />
                  </View>
                  <Text className="text-base font-semibold text-brand-700">Rs. {Number(order.amount || 0).toLocaleString('en-IN')}</Text>
                  <Text className="text-sm text-slate-500">Seller: {order.seller?.name || 'MarketLoop seller'}</Text>
                  {order.invoice ? <Text className="text-sm font-medium text-sky-700">Invoice: {order.invoice.invoiceNumber}</Text> : null}
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
