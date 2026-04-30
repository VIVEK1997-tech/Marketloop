import { apiClient } from './client';
import { CheckoutGatewaysResponse, OrderDetailResponse, OrderSummary, PaymentSession, PaymentStatusResponse } from '@/types/models';

export const paymentRepository = {
  getCheckoutGateways: async () => {
    const { data } = await apiClient.get<CheckoutGatewaysResponse>('/payment/gateways');
    return data;
  },
  createCheckoutOrder: async (productId: string, gatewayId: string, quantity = 1) => {
    const { data } = await apiClient.post<PaymentSession>('/payment/orders', { productId, gatewayId, quantity });
    return data;
  },
  createRazorpayOrder: async (productId: string, quantity = 1) => {
    return paymentRepository.createCheckoutOrder(productId, 'razorpay_checkout', quantity);
  },
  createPayuOrder: async (productId: string, quantity = 1) => {
    return paymentRepository.createCheckoutOrder(productId, 'payu_india', quantity);
  },
  getOrders: async () => {
    const { data } = await apiClient.get<{ orders: OrderSummary[] }>('/payment/orders');
    return data.orders || [];
  },
  getOrderDetail: async (orderId: string) => {
    const { data } = await apiClient.get<OrderDetailResponse>(`/payment/orders/${orderId}`);
    return data;
  },
  getOrderStatus: async (orderId: string) => {
    const { data } = await apiClient.get<PaymentStatusResponse>(`/payment/status/${orderId}`);
    return data;
  },
  verifyPayment: async (gatewayId: string, orderId: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/payment/verify', {
      gatewayId,
      orderId,
      payload
    });
    return data;
  },
  verifyHdfcPayment: async ({
    orderId,
    gatewayOrderId,
    receipt,
    mockStatus,
    mockTxnId
  }: {
    orderId: string;
    gatewayOrderId?: string;
    receipt?: string;
    mockStatus?: string;
    mockTxnId?: string;
  }) => {
    const { data } = await apiClient.post('/payment/hdfc/status', {
      orderId,
      gatewayOrderId,
      receipt,
      mockStatus,
      mockTxnId
    });
    return data;
  }
};
