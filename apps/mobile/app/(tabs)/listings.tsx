import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { FilterChip } from '@/components/marketplace/FilterChip';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatCard } from '@/components/ui/StatCard';
import { marketplaceRepository } from '@/services/api/marketplace.repository';
import { useAuthStore } from '@/store/auth-store';

export default function ListingsScreen() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const { data: products = [] } = useQuery({
    queryKey: ['seller-products'],
    queryFn: marketplaceRepository.getSellerProducts,
    enabled: role === 'seller'
  });

  const markSoldMutation = useMutation({
    mutationFn: (productId: string) => marketplaceRepository.markSold(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-summary'] });
    },
    onError: (error) => {
      Alert.alert('Unable to mark listing as sold', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    return products.filter((product) => String(product.status).toLowerCase() === filter);
  }, [filter, products]);

  if (role !== 'seller') {
    return (
      <Screen>
        <EmptyState title="Seller tools hidden" description="Switch to seller mode to manage your listings." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="My listings" subtitle="Manage available inventory, edit listing details, and close out sold deals." />

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[48%] flex-1">
            <StatCard label="All listings" value={String(products.length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Available" value={String(products.filter((product) => product.status === 'available').length)} />
          </View>
          <View className="min-w-[48%] flex-1">
            <StatCard label="Sold" value={String(products.filter((product) => product.status === 'sold').length)} />
          </View>
        </View>

        <Button label="Add listing" onPress={() => router.push('/seller/listing-form')} />

        <View className="flex-row gap-3">
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="Available" active={filter === 'available'} onPress={() => setFilter('available')} />
          <FilterChip label="Sold" active={filter === 'sold'} onPress={() => setFilter('sold')} />
        </View>

        {!filteredProducts.length ? (
          <EmptyState title="No listings yet" description="Create your first listing to start selling on MarketLoop." />
        ) : null}

        {filteredProducts.map((product) => (
          <Card key={product._id}>
            <View className="gap-3">
              <Pressable onPress={() => router.push(`/product/${product._id}`)}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-900">{product.title}</Text>
                    <Text className="mt-1 text-sm text-slate-500">
                      {product.quantity || 0} {product.unit || 'Kg'} - {product.category}
                    </Text>
                    <Text className="mt-2 text-base font-semibold text-brand-700">Rs. {product.price}</Text>
                  </View>
                  <StatusPill label={product.status || 'available'} tone={product.status === 'sold' ? 'success' : 'info'} />
                </View>
              </Pressable>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button label="Edit" variant="secondary" onPress={() => router.push(`/seller/listing-form?productId=${product._id}`)} />
                </View>
                {product.status !== 'sold' ? (
                  <View className="flex-1">
                    <Button
                      label={markSoldMutation.isPending ? 'Updating...' : 'Mark sold'}
                      onPress={() => markSoldMutation.mutate(product._id)}
                      disabled={markSoldMutation.isPending}
                    />
                  </View>
                ) : null}
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
