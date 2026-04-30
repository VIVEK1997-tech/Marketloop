import { paymentRepository } from '@/services/api/payment.repository';

export type PaymentGateway = 'razorpay' | 'payu' | 'phonepe' | 'cashfree' | 'hdfc';

const gatewayIds: Record<PaymentGateway, string> = {
  razorpay: 'razorpay_checkout',
  payu: 'payu_india',
  phonepe: 'phonepe_pg',
  cashfree: 'cashfree_payments',
  hdfc: 'hdfc_smartgateway'
};

export const toPaymentGatewayId = (gateway: PaymentGateway) => gatewayIds[gateway];

export const getPaymentGatewayTitle = (gateway?: string) => (
  gateway === 'payu' ? 'PayU'
    : gateway === 'phonepe' ? 'PhonePe'
      : gateway === 'cashfree' ? 'Cashfree'
        : gateway === 'hdfc' ? 'HDFC SmartGateway'
          : 'Razorpay'
);

export const paymentService = {
  createSession: async (productId: string, gateway: PaymentGateway, quantity = 1) => {
    return paymentRepository.createCheckoutOrder(productId, toPaymentGatewayId(gateway), quantity);
  }
};
