import { Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { ReviewSummary } from '@/types/models';

interface ProductReviewCardProps {
  summary?: ReviewSummary;
}

export const ProductReviewCard = ({ summary }: ProductReviewCardProps) => (
  <Card>
    <Text className="text-lg font-bold text-slate-900">Ratings & reviews</Text>
    {summary ? (
      <View className="mt-3 gap-2">
        <Text className="text-3xl font-black text-slate-900">{summary.averageRating.toFixed(1)}</Text>
        <Text className="text-sm text-slate-500">
          Based on {summary.totalReviews} seller review{summary.totalReviews === 1 ? '' : 's'} covering freshness, seller response, and fulfilment quality.
        </Text>
        {summary.reviews.slice(0, 2).map((review) => (
          <View key={review._id} className="mt-2 rounded-2xl bg-slate-50 p-3">
            <Text className="text-sm font-bold text-slate-900">{review.reviewer?.name || 'MarketLoop buyer'}</Text>
            <Text className="mt-1 text-xs text-slate-500">{review.rating}/5 - {new Date(review.createdAt).toLocaleDateString()}</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">{review.reviewText}</Text>
          </View>
        ))}
      </View>
    ) : (
      <Text className="mt-2 text-sm leading-6 text-slate-500">Reviews will show here as soon as buyers interact with this seller or product.</Text>
    )}
  </Card>
);
