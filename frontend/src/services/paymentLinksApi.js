import { api, extractApiData } from './api.js';

export const createPaymentLink = async ({ userId, amount, currency = 'INR', notes = '' }) => {
  const response = await api.post('/create-payment', {
    user_id: userId,
    amount,
    currency,
    notes
  });
  return extractApiData(response);
};

export const updateTrackedPaymentStatus = async ({ paymentId, status, notes = '' }) => {
  const response = await api.post('/update-payment-status', {
    payment_id: paymentId,
    status,
    notes
  });
  return extractApiData(response);
};

export const getTrackedPayment = async (paymentId) => {
  const response = await api.get(`/payment/${paymentId}`);
  return extractApiData(response);
};

export const listTrackedPayments = async ({ status = '', userId = '' } = {}) => {
  const response = await api.get('/admin/payments', {
    params: {
      ...(status ? { status } : {}),
      ...(userId ? { user_id: userId } : {})
    }
  });
  return extractApiData(response);
};

export const simulateTrackedPaymentWebhook = async (paymentId, status = 'SUCCESS') => {
  const response = await api.post(`/payments/${paymentId}/simulate-webhook`, { status });
  return extractApiData(response);
};
