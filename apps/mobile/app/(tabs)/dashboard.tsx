import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardScreen() {
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const { data } = useQuery({
    queryKey: ['seller-summary'],
    queryFn: userRepository.getSellerSummary,
    enabled: role === 'seller'
  });

  if (role !== 'seller') {
    return (
      <Screen>
        <EmptyState title="Seller tools hidden" description="Switch to seller mode to view listings, chats, orders, and finance." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Seller dashboard" subtitle="Run your MarketLoop storefront, track buyers, and stay on top of invoices from mobile." />

        <View className="flex-row flex-wrap gap-3">
          <StatCard label="Listings" value={String(data?.listingsCount || 0)} onPress={() => router.push('/(tabs)/listings')} />
          <StatCard label="Sold" value={String(data?.soldCount || 0)} onPress={() => router.push('/(tabs)/listings')} />
          <StatCard label="Buyer chats" value={String(data?.buyerChatsCount || 0)} onPress={() => router.push('/chat')} />
          <StatCard label="Pending invoices" value={String(data?.pendingInvoices || 0)} onPress={() => router.push('/(tabs)/finance')} />
          <StatCard label="Paid invoices" value={String(data?.paidInvoices || 0)} onPress={() => router.push('/(tabs)/finance')} />
        </View>

        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-slate-900">Recent listings</Text>
              <Text className="mt-1 text-sm text-slate-500">Jump back into the products you updated most recently.</Text>
            </View>
            <Pressable onPress={() => router.push('/seller/listing-form')}>
              <Text className="text-sm font-semibold text-brand-700">Add new</Text>
            </Pressable>
          </View>
          <View className="mt-4 gap-3">
            {data?.recentListings?.length ? (
              data.recentListings.map((listing) => (
                <Pressable key={listing._id} onPress={() => router.push(`/seller/listing-form?productId=${listing._id}`)}>
                  <View className="rounded-2xl bg-slate-50 p-3">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-900">{listing.title}</Text>
                        <Text className="mt-1 text-sm text-slate-500">Rs. {listing.price} / {listing.unit || 'Kg'}</Text>
                      </View>
                      <StatusPill label={listing.status} tone={listing.status === 'sold' ? 'success' : 'info'} />
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text className="text-sm text-slate-500">Your latest listings will appear here after you publish them.</Text>
            )}
          </View>
        </Card>

        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-slate-900">Recent buyer orders</Text>
              <Text className="mt-1 text-sm text-slate-500">See which buyers are actively purchasing and move quickly into follow-up.</Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/orders')}>
              <Text className="text-sm font-semibold text-brand-700">View all</Text>
            </Pressable>
          </View>
          <View className="mt-4 gap-3">
            {data?.recentOrders?.length ? (
              data.recentOrders.map((order) => (
                <Pressable key={order._id} onPress={() => router.push(`/orders/${order._id}`)}>
                  <View className="rounded-2xl bg-slate-50 p-3">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-900">{order.product?.title || 'Order'}</Text>
                        <Text className="mt-1 text-sm text-slate-500">{order.buyer?.name || 'Buyer'} - Rs. {order.amount}</Text>
                      </View>
                      <StatusPill
                        label={order.paymentStatus}
                        tone={order.paymentStatus === 'success' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'danger'}
                      />
                    </View>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text className="text-sm text-slate-500">New buyer orders will show up here once checkout activity starts.</Text>
            )}
          </View>
        </Card>
      </View>
    </Screen>
  );
}
