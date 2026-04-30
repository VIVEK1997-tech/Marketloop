import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { ProductGallery } from '@/components/product-detail/ProductGallery';
import { ProductBuyingOptionsCard } from '@/components/product-detail/ProductBuyingOptionsCard';
import { ProductOverviewCard } from '@/components/product-detail/ProductOverviewCard';
import { ProductQualityCard } from '@/components/product-detail/ProductQualityCard';
import { ProductRecommendationSection } from '@/components/product-detail/ProductRecommendationSection';
import { ProductReviewCard } from '@/components/product-detail/ProductReviewCard';
import { ProductSellerCard } from '@/components/product-detail/ProductSellerCard';
import { ProductStickyActions } from '@/components/product-detail/ProductStickyActions';
import { Screen } from '@/components/ui/Screen';
import { reviewRepository } from '@/services/api/review.repository';
import { chatRepository } from '@/services/api/chat.repository';
import { marketplaceRepository } from '@/services/api/marketplace.repository';
import { userRepository } from '@/services/api/user.repository';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const activeRole = user?.activeRole || user?.role;
  const addItem = useCartStore((state) => state.addItem);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const getQuantity = useCartStore((state) => state.getQuantity);
  const [messagingSeller, setMessagingSeller] = useState(false);
  const [openingCheckout, setOpeningCheckout] = useState(false);

  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: () => marketplaceRepository.getProduct(String(id)),
    enabled: !!id
  });
  const { data: recommendations = [] } = useQuery({
    queryKey: ['product-recommendations', id],
    queryFn: () => marketplaceRepository.getRecommendations(String(id)),
    enabled: !!id
  });
  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userRepository.getWishlist,
    enabled: activeRole === 'buyer'
  });
  const { data: sellerReviews } = useQuery({
    queryKey: ['seller-reviews', product?.seller?._id],
    queryFn: () => reviewRepository.getSellerReviews(String(product?.seller?._id)),
    enabled: Boolean(product?.seller?._id)
  });
  const { data: productReviews } = useQuery({
    queryKey: ['product-reviews', product?._id],
    queryFn: () => reviewRepository.getProductReviews(String(product?._id)),
    enabled: Boolean(product?._id)
  });

  const savedIds = new Set(wishlist.map((item) => item._id));
  const isSaved = product ? savedIds.has(product._id) : false;

  const wishlistMutation = useMutation({
    mutationFn: async (productId?: string) => {
      const targetProductId = productId || product?._id;
      if (!targetProductId) return [];
      const targetIsSaved = savedIds.has(targetProductId);
      if (targetIsSaved) return userRepository.removeFromWishlist(targetProductId);
      return userRepository.addToWishlist(targetProductId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'for-you'] });
    }
  });

  if (!product) {
    return (
      <Screen>
        <Text className="text-base text-slate-500">Loading product...</Text>
      </Screen>
    );
  }

  const quantity = getQuantity(product._id);

  const openChat = async () => {
    if (!product.seller?._id) return;
    try {
      setMessagingSeller(true);
      const conversation = await chatRepository.createConversation(product.seller._id, product._id);
      router.push(`/chat/${conversation._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to open seller chat right now.';
      Alert.alert('Seller chat unavailable', message);
    } finally {
      setMessagingSeller(false);
    }
  };

  const openCheckout = () => {
    try {
      setOpeningCheckout(true);
      router.push({
        pathname: '/checkout/[productId]',
        params: { productId: product._id }
      });
    } finally {
      setOpeningCheckout(false);
    }
  };

  return (
    <Screen scroll={false}>
      <View className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
          <ProductGallery images={product.images} />
          <ProductOverviewCard product={product} />
          <ProductBuyingOptionsCard
            product={product}
            quantity={quantity}
            activeRole={activeRole}
            onAddToCart={() => addItem(product).catch(() => undefined)}
            onIncreaseQuantity={() => incrementItem(product._id).catch(() => undefined)}
            onDecreaseQuantity={() => decrementItem(product._id).catch(() => undefined)}
            onBuyNow={openCheckout}
            loading={openingCheckout}
          />
          <ProductQualityCard />
          <ProductSellerCard
            sellerName={product.seller?.name}
            sellerPhone={product.seller?.phone}
            reviewSummary={sellerReviews}
            onMessageSeller={openChat}
            messaging={messagingSeller}
          />
          <ProductReviewCard summary={productReviews} />
          <ProductRecommendationSection
            items={recommendations.slice(0, 8)}
            savedIds={savedIds}
            getQuantity={getQuantity}
            onOpenProduct={(productId) => router.replace(`/product/${productId}`)}
            onToggleWishlist={(productId) => wishlistMutation.mutate(productId)}
            onAddToCart={(nextProduct) => addItem(nextProduct).catch(() => undefined)}
            onIncreaseQuantity={(productId) => incrementItem(productId).catch(() => undefined)}
            onDecreaseQuantity={(productId) => decrementItem(productId).catch(() => undefined)}
          />
        </ScrollView>

        {activeRole === 'buyer' ? (
          <ProductStickyActions
            quantity={quantity}
            onAddToCart={() => addItem(product).catch(() => undefined)}
            onIncreaseQuantity={() => incrementItem(product._id).catch(() => undefined)}
            onDecreaseQuantity={() => decrementItem(product._id).catch(() => undefined)}
            onBuyNow={openCheckout}
            onToggleWishlist={() => wishlistMutation.mutate(undefined)}
            saved={isSaved}
          />
        ) : null}
      </View>
    </Screen>
  );
}
