import { api, extractApiData } from './api.js';

export const productApi = {
  async getCategories() {
    const response = await api.get('/products/categories');
    return extractApiData(response).categories || [];
  },

  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return extractApiData(response).product;
  },

  async getRecommendations(productId) {
    const response = await api.get(`/products/${productId}/recommendations`);
    const data = extractApiData(response);
    return {
      recommendations: data.recommendations || [],
      meta: data.meta || null
    };
  },

  async getSellerListings(sellerId) {
    const response = await api.get(`/products/seller/${sellerId}`);
    return extractApiData(response).products || [];
  }
};
