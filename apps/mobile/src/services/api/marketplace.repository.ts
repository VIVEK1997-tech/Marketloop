import { apiClient } from './client';
import { MarketplaceProduct } from '@/types/models';

export const marketplaceRepository = {
  getProducts: async (params?: Record<string, unknown>) => {
    const normalizedParams = params
      ? {
          ...params,
          keyword: params.search ?? params.keyword
        }
      : undefined;
    if (normalizedParams && 'search' in normalizedParams) delete normalizedParams.search;
    const { data } = await apiClient.get<{ products: MarketplaceProduct[] }>('/products', { params: normalizedParams });
    return data.products || [];
  },
  getProduct: async (id: string) => {
    const { data } = await apiClient.get<{ product: MarketplaceProduct }>(`/products/${id}`);
    return data.product;
  },
  getRecommendations: async (id: string) => {
    const { data } = await apiClient.get<{ products?: MarketplaceProduct[]; recommendations?: MarketplaceProduct[] }>(`/products/${id}/recommendations`);
    return data.products || data.recommendations || [];
  },
  getPersonalizedRecommendations: async () => {
    const { data } = await apiClient.get<{ recommendations: MarketplaceProduct[] }>('/products/recommendations/for-you');
    return data.recommendations || [];
  },
  getNearbyProducts: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get<{ products: MarketplaceProduct[] }>('/products/nearby', { params });
    return data.products || [];
  },
  getSellerProducts: async () => {
    const { data } = await apiClient.get<{ products: MarketplaceProduct[] }>('/products/seller/me');
    return data.products || [];
  },
  createProduct: async (formData: FormData) => {
    const { data } = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  updateProduct: async (id: string, formData: FormData) => {
    const { data } = await apiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  markSold: async (id: string) => {
    const { data } = await apiClient.patch(`/products/${id}/sold`);
    return data;
  }
};
