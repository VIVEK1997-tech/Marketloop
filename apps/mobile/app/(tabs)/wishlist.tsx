import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { MarketplaceProductCard } from '@/components/marketplace/MarketplaceProductCard';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';

export default function WishlistScreen() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userRepository.getWishlist,
    enabled: role === 'buyer'
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => userRepository.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'for-you'] });
    }
  });

  if (role !== 'buyer') {
    return (
      <Screen>
        <EmptyState title="Wishlist is buyer-only" description="Switch to buyer mode to save and review listings." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Wishlist" subtitle="Saved listings stay here so you can compare, chat, and checkout later." />

        <Card>
          <Text className="text-3xl font-black text-slate-900">{wishlist.length}</Text>
          <Text className="mt-1 text-sm text-slate-500">saved product{wishlist.length === 1 ? '' : 's'} in your buyer shortlist</Text>
        </Card>

        {!wishlist.length ? (
          <EmptyState title="No saved products" description="Tap the wishlist button from product details or search results to save listings here." />
        ) : (
          wishlist.map((product) => (
            <MarketplaceProductCard
              key={product._id}
              product={product}
              saved
              onPress={() => router.push(`/product/${product._id}`)}
              onToggleWishlist={() => removeMutation.mutate(product._id)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
