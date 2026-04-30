import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ReviewSummary } from '@/types/models';

interface ProductSellerCardProps {
  sellerName?: string;
  sellerPhone?: string;
  reviewSummary?: ReviewSummary;
  onMessageSeller: () => void;
  messaging?: boolean;
}

export const ProductSellerCard = ({
  sellerName,
  sellerPhone,
  reviewSummary,
  onMessageSeller,
  messaging = false
}: ProductSellerCardProps) => (
  <Card>
    <Text className="text-lg font-bold text-slate-900">Seller snapshot</Text>
    <View className="mt-4 flex-row items-center gap-3">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-50">
        <FontAwesome name="shopping-basket" size={18} color="#16a34a" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-slate-900">{sellerName || 'MarketLoop seller'}</Text>
        <Text className="mt-1 text-sm text-slate-500">{sellerPhone || 'Phone shared after conversation starts'}</Text>
        {reviewSummary ? (
          <Text className="mt-1 text-xs text-slate-500">
            {reviewSummary.averageRating.toFixed(1)} rating - {reviewSummary.totalReviews} review{reviewSummary.totalReviews === 1 ? '' : 's'}
          </Text>
        ) : null}
      </View>
    </View>
    <View className="mt-4">
      <Button label="Message seller" variant="secondary" onPress={onMessageSeller} loading={messaging} />
    </View>
  </Card>
);
