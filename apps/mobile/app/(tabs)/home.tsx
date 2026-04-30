import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { HomeProductRailCard } from '@/components/marketplace/HomeProductRailCard';
import { PromoBanner } from '@/components/marketplace/PromoBanner';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { HomeCategoryRail } from '@/components/home/HomeCategoryRail';
import { HomeHero } from '@/components/home/HomeHero';
import { HomeMetricRail } from '@/components/home/HomeMetricRail';
import { HomeShortcutRail } from '@/components/home/HomeShortcutRail';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { marketplaceRepository } from '@/services/api/marketplace.repository';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/theme/marketloop';

const buyerQuickSections = [
  { title: 'Daily essentials', subtitle: 'Fruits, veggies, and staples', icon: 'shopping-basket', route: '/(tabs)/search' },
  { title: 'Track orders', subtitle: 'Live status and invoices', icon: 'truck', route: '/(tabs)/orders' },
  { title: 'Wishlist', subtitle: 'Saved picks and repeat buys', icon: 'heart', route: '/(tabs)/wishlist' },
  { title: 'Support', subtitle: 'Refunds, complaints, and help', icon: 'life-ring', route: '/support' }
] as const;

const sellerQuickSections = [
  { title: 'Add listing', subtitle: 'Create a new product', icon: 'plus-square', route: '/seller/listing-form' },
  { title: 'Orders', subtitle: 'Track buyer orders', icon: 'list-alt', route: '/(tabs)/orders' },
  { title: 'Listings', subtitle: 'Manage products', icon: 'th-large', route: '/(tabs)/listings' },
  { title: 'Finance', subtitle: 'Invoices and payments', icon: 'money', route: '/(tabs)/finance' }
] as const;

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.activeRole || state.user?.role);
  const userName = useAuthStore((state) => state.user?.name?.split(' ')[0] || 'there');
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const cartTotal = useCartStore((state) => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const getQuantity = useCartStore((state) => state.getQuantity);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => marketplaceRepository.getProducts({ status: 'available', sort: 'latest' })
  });
  const { data: picks = [] } = useQuery({
    queryKey: ['products', 'for-you'],
    queryFn: marketplaceRepository.getPersonalizedRecommendations,
    enabled: role !== 'seller'
  });
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userRepository.getWishlist,
    enabled: role !== 'seller'
  });
  const { data: sellerSummary } = useQuery({
    queryKey: ['seller-summary'],
    queryFn: userRepository.getSellerSummary,
    enabled: role === 'seller'
  });

  const categories = ['All', ...new Set(products.map((product) => product.category).filter(Boolean))].slice(0, 8);
  const trendingProducts = products.filter((product) => ['Fruits', 'Vegetables', 'Dairy', 'Snacks'].includes(product.category)).slice(0, 8);
  const featuredProducts = products.slice(0, 8);
  const quickReorderProducts = wishlist.length ? wishlist.slice(0, 6) : products.slice(0, 6);
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

  const renderProductRail = (productsToRender: typeof products, allowWishlist = true) => {
    if (!productsToRender.length) {
      return <EmptyState title="Products are loading" description="Live marketplace inventory will appear here as soon as it is available." />;
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pr-4">
          {productsToRender.map((product) => (
            <HomeProductRailCard
              key={product._id}
              product={product}
              saved={savedIds.has(product._id)}
              quantity={getQuantity(product._id)}
              onPress={() => router.push(`/product/${product._id}`)}
              onToggleWishlist={allowWishlist ? () => wishlistMutation.mutate(product._id) : undefined}
              onAddToCart={() => addItem(product)}
              onIncreaseQuantity={() => incrementItem(product._id)}
              onDecreaseQuantity={() => decrementItem(product._id)}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <Screen>
      <View className="gap-6">
        <HomeHero
          eyebrow={role === 'seller' ? 'Marketloop seller home' : 'Marketloop groceries'}
          title={role === 'seller' ? `Welcome back, ${userName}` : `Hi ${userName}, get groceries in 10 minutes`}
          subtitle={
            role === 'seller'
              ? 'Run your storefront, follow buyer demand, and jump into listings, orders, and payouts from a cleaner marketplace-style home.'
              : 'Fresh produce, dairy, snacks, and daily essentials with clear pricing, trusted sellers, and a fast checkout flow.'
          }
          badge={role === 'seller' ? `${sellerSummary?.listingsCount || 0} listings` : `${cartCount} in cart`}
          searchPlaceholder={role === 'seller' ? 'Search your listings, orders, or finance...' : 'Search for groceries, fruits, vegetables...'}
          searchRoute={role === 'seller' ? '/(tabs)/listings' : '/(tabs)/search'}
          chips={
            role === 'seller'
              ? [`${sellerSummary?.buyerChatsCount || 0} buyer chats`, `${sellerSummary?.pendingInvoices || 0} pending invoices`, `${sellerSummary?.soldCount || 0} sold items`]
              : ['10 min delivery', 'Freshness checked', 'Trusted sellers']
          }
          onNavigate={(route) => router.push(route as never)}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3 pr-4">
            <View className="w-[290px]">
              <PromoBanner
                badge={role === 'seller' ? 'Seller boost' : 'Today only'}
                title={role === 'seller' ? 'Keep your fresh inventory moving' : 'Up to 25% off on fresh produce'}
                subtitle={
                  role === 'seller'
                    ? 'Publish listings faster, follow buyer demand, and stay on top of payments from one polished landing page.'
                    : 'Shop fruits, vegetables, dairy, and pantry staples from trusted suppliers with transparent pricing.'
                }
              />
            </View>
            <View className="w-[290px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-amber-600">Flash offers</Text>
              <Text className="mt-2 text-2xl font-black text-slate-900">{role === 'seller' ? 'Track demand spikes' : 'Buy more, save more'}</Text>
              <Text className="mt-3 text-sm leading-6 text-slate-500">
                {role === 'seller'
                  ? 'See where the marketplace is heating up and restock high-interest categories first.'
                  : 'Stack coupons, smart deals, and seller discounts just like a real quick-commerce app.'}
              </Text>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-amber-100 px-3 py-1"><Text className="text-xs font-semibold text-amber-700">Extra 10% on fruits</Text></View>
                <View className="rounded-full bg-emerald-100 px-3 py-1"><Text className="text-xs font-semibold text-emerald-700">Free delivery over Rs. 699</Text></View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="gap-3">
          <SectionHeader
            title={role === 'seller' ? 'Seller quick actions' : 'Marketloop sections'}
            subtitle={role === 'seller' ? 'Jump into storefront tasks without opening a heavy dashboard first.' : 'Fast entry points that make the app feel more like a real grocery product.'}
          />
          <HomeShortcutRail items={role === 'seller' ? sellerQuickSections : buyerQuickSections} onNavigate={(route) => router.push(route as never)} />
        </View>

        <View className="gap-3">
          <SectionHeader
            title={role === 'seller' ? 'Browse marketplace categories' : 'Shop by category'}
            subtitle={role === 'seller' ? 'Stay close to what buyers are actively shopping across the marketplace.' : 'Quick category-first browsing like a real grocery app home.'}
          />
          <HomeCategoryRail categories={categories.filter((category) => category !== 'All')} onNavigate={(category) => router.push(`/(tabs)/search?category=${encodeURIComponent(category)}`)} />
        </View>

        <View className="gap-3">
          <SectionHeader
            title={role === 'seller' ? 'Marketplace demand' : 'Trending on Marketloop'}
            subtitle={role === 'seller' ? 'A demand feed that keeps seller home closer to a real commerce app.' : 'Popular picks across fruits, vegetables, dairy, and snacks right now.'}
          />
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : (
            renderProductRail(trendingProducts, role !== 'seller')
          )}
        </View>

        <View className="gap-3">
          <SectionHeader
            title={role === 'seller' ? 'Fresh arrivals in the marketplace' : 'Best deals today'}
            subtitle={role === 'seller' ? 'See what is newly live and how the catalog is moving.' : 'Fast-moving stock with clear offers and easy add-to-cart controls.'}
          />
          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : (
            renderProductRail(featuredProducts, role !== 'seller')
          )}
        </View>

        {role !== 'seller' ? (
          <View className="gap-3">
            <SectionHeader title="Recommended for you" subtitle="Personalized picks based on your saved items and marketplace activity." />
            {picks.length ? renderProductRail(picks.slice(0, 8), true) : <EmptyState title="Personalized picks will show here" description="Save a few listings and Marketloop will start tailoring this section." />}
          </View>
        ) : null}

        <View className="gap-3">
          <SectionHeader
            title={role === 'seller' ? 'Quick visibility' : 'Quick reorder'}
            subtitle={role === 'seller' ? 'Keep important inventory and recent activity close at hand.' : 'Easy access to saved items and repeat grocery purchases.'}
          />
          {role === 'seller' ? (
            <HomeMetricRail
              metrics={[
                { label: 'Listings', value: String(sellerSummary?.listingsCount || 0) },
                { label: 'Sold', value: String(sellerSummary?.soldCount || 0) },
                { label: 'Paid invoices', value: String(sellerSummary?.paidInvoices || 0) },
                { label: 'Pending invoices', value: String(sellerSummary?.pendingInvoices || 0) }
              ]}
            />
          ) : quickReorderProducts.length ? (
            renderProductRail(quickReorderProducts, true)
          ) : (
            <EmptyState title="Reorder section will fill up soon" description="Save listings to your wishlist or add items to cart so repeat shopping becomes faster." />
          )}
        </View>

        {cartCount && role !== 'seller' ? (
          <Pressable onPress={() => router.push('/(tabs)/cart')}>
            <View className="rounded-[22px] bg-slate-900 px-4 py-4">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white">{cartCount} item{cartCount === 1 ? '' : 's'} ready</Text>
                  <Text className="mt-1 text-xs text-slate-300">Open cart anytime to review your total and checkout.</Text>
                </View>
                <View className="items-end">
                  <Text className="text-base font-black text-emerald-300">{formatCurrency(cartTotal)}</Text>
                  <Text className="mt-1 text-xs font-semibold text-slate-300">View cart</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}
