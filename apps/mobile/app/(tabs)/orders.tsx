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

const getOrderTone = (status?: string) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'success') return 'success' as const;
  if (normalized === 'pending') return 'warning' as const;
  if (normalized === 'failed') return 'danger' as const;
  return 'neutral' as const;
};

export default function OrdersScreen() {
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: paymentRepository.getOrders
  });

  const successfulOrders = orders.filter((order) => String(order.paymentStatus).toLowerCase() === 'success');
  const pendingOrders = orders.filter((order) => String(order.paymentStatus).toLowerCase() === 'pending');
  const totalSpend = successfulOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Orders" subtitle="Track payment state, invoice access, and delivery progress from one place." />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[48%] flex-1">
            <StatCard label="All orders" value={String(orders.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Pending" value={String(pendingOrders.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Completed" value={String(successfulOrders.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Spend" value={`Rs. ${totalSpend.toLocaleString('en-IN')}`} />
          </View>
        </View>

        {!orders.length ? (
          <EmptyState title="No orders yet" description="Your orders will appear here after payment." />
        ) : (
          orders.map((order) => (
            <Pressable key={order._id} onPress={() => router.push(`/orders/${order._id}`)}>
              <Card>
                <View className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">{order.product?.title || 'Order'}</Text>
                      <Text className="mt-1 text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.seller?.name || 'Seller'}
                      </Text>
                    </View>
                    <StatusPill label={order.paymentStatus} tone={getOrderTone(order.paymentStatus)} />
                  </View>
                  <Text className="text-base font-semibold text-brand-700">Rs. {Number(order.amount || 0).toLocaleString('en-IN')}</Text>
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
