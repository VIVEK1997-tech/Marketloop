import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { CategoryTile } from '@/components/marketplace/CategoryTile';
import { FilterChip } from '@/components/marketplace/FilterChip';
import { MarketplaceProductCard } from '@/components/marketplace/MarketplaceProductCard';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { marketplaceRepository } from '@/services/api/marketplace.repository';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

const sortOptions = [
  { label: 'Latest', value: 'latest' },
  { label: 'Price low-high', value: 'priceAsc' },
  { label: 'Price high-low', value: 'priceDesc' }
] as const;

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const getQuantity = useCartStore((state) => state.getQuantity);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [selectedSort, setSelectedSort] = useState<(typeof sortOptions)[number]['value']>('latest');

  useEffect(() => {
    setSelectedCategory(params.category || 'All');
  }, [params.category]);

  const { data: products = [] } = useQuery({
    queryKey: ['products', 'search', query, selectedCategory, selectedSort],
    queryFn: () =>
      marketplaceRepository.getProducts({
        keyword: query || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        sort: selectedSort,
        status: 'available'
      })
  });
  const { data: availableProducts = [] } = useQuery({
    queryKey: ['products', 'catalog'],
    queryFn: () => marketplaceRepository.getProducts({ status: 'available', sort: 'latest' })
  });
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userRepository.getWishlist,
    enabled: role === 'buyer'
  });

  const categoryOptions = useMemo(
    () => ['All', ...new Set(availableProducts.map((product) => product.category).filter(Boolean))].slice(0, 10),
    [availableProducts]
  );
  const savedIds = new Set(wishlist.map((item) => item._id));

  const wishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (savedIds.has(productId)) return userRepository.removeFromWishlist(productId);
      return userRepository.addToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'for-you'] });
    }
  });

  if (role === 'seller') {
    return (
      <Screen>
        <Card>
          <Text className="text-lg font-bold text-slate-900">Search is buyer-first in v1</Text>
          <Text className="mt-2 text-sm text-slate-500">Switch roles if you want to browse the marketplace as a buyer.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Categories" subtitle="Search groceries, sort by price, and add straight to cart with minimal friction." />
        <View className="flex-row items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4">
          <FontAwesome name="search" size={16} color="#64748b" />
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search for groceries..."
            className="flex-1 border-0 bg-transparent px-0"
            style={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 }}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-700">Shop by category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-4">
              {categoryOptions.filter((category) => category !== 'All').map((category) => (
                <CategoryTile
                  key={category}
                  label={category}
                  active={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
              <CategoryTile label="All" active={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
            </View>
          </ScrollView>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-semibold text-slate-700">Sort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pr-4">
              {sortOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  active={selectedSort === option.value}
                  onPress={() => setSelectedSort(option.value)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        <Card>
          <Text className="text-sm text-slate-500">
            {products.length} result{products.length === 1 ? '' : 's'} for {query ? `"${query}"` : 'your current filters'}
          </Text>
        </Card>

        {products.length ? (
          products.slice(0, 30).map((product) => (
            <MarketplaceProductCard
              key={product._id}
              product={product}
              saved={savedIds.has(product._id)}
              compact
              quantity={getQuantity(product._id)}
              onPress={() => router.push(`/product/${product._id}`)}
              onToggleWishlist={() => wishlistMutation.mutate(product._id)}
              onAddToCart={() => addItem(product)}
              onIncreaseQuantity={() => incrementItem(product._id)}
              onDecreaseQuantity={() => decrementItem(product._id)}
            />
          ))
        ) : (
          <EmptyState title="No listings matched" description="Try a broader keyword, reset the category, or explore another produce type." />
        )}
      </View>
    </Screen>
  );
}
