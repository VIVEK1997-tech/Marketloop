import { apiClient } from './client';
import { ReviewSummary } from '@/types/models';

export const reviewRepository = {
  getProductReviews: async (productId: string) => {
    const { data } = await apiClient.get<ReviewSummary>(`/reviews/product/${productId}`);
    return data;
  },
  getSellerReviews: async (sellerId: string) => {
    const { data } = await apiClient.get<ReviewSummary>(`/reviews/seller/${sellerId}`);
    return data;
  }
};
