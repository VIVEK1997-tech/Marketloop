import { api, extractApiData } from './api.js';
import { openCashfreeHostedCheckout } from './cashfree.js';
import { submitPayuCheckout } from './payu.js';
import { loadRazorpayCheckout } from './razorpay.js';

export const createCheckoutOrder = async ({ productId, quantity = 1, gatewayId }) => {
  const response = await api.post('/orders', {
    productId,
    quantity,
    gatewayId
  });

  return extractApiData(response);
};

export const createPhonePePayment = async ({ productId, quantity = 1 }) => {
  const response = await api.post('/payment/phonepe/create', {
    productId,
    quantity
  });

  return extractApiData(response);
};

export const createCashfreePayment = async ({ productId, quantity = 1 }) => {
  const response = await api.post('/payment/cashfree/create', {
    productId,
    quantity
  });

  return extractApiData(response);
};

export const createHdfcPayment = async ({ productId, quantity = 1 }) => {
  const response = await api.post('/payment/hdfc/create-session', {
    productId,
    quantity
  });

  return extractApiData(response);
};

export const verifyCheckoutPayment = async ({ gatewayId, orderId, payload }) => {
  const response = await api.post('/payment/verify', {
    gatewayId,
    orderId,
    payload
  });

  return extractApiData(response);
};

export const verifyPhonePePayment = async ({ orderId, transactionId, merchantTransactionId }) => {
  const response = await api.post('/payment/phonepe/verify', {
    orderId,
    transactionId,
    merchantTransactionId
  });

  return extractApiData(response);
};

export const verifyCashfreePayment = async ({ orderId, cashfreeOrderId }) => {
  const response = await api.post('/payment/cashfree/verify', {
    orderId,
    cashfreeOrderId
  });

  return extractApiData(response);
};

export const verifyHdfcPayment = async ({
  orderId,
  localOrderId,
  gatewayOrderId,
  receipt,
  mockStatus,
  mockTxnId
}) => {
  const response = await api.post('/payment/hdfc/status', {
    orderId: orderId || localOrderId,
    localOrderId: localOrderId || orderId,
    gatewayOrderId,
    receipt,
    mockStatus,
    mockTxnId
  });

  return extractApiData(response);
};

export const recordFailedCheckoutPayment = async ({ orderId, gatewayId, error }) => {
  try {
    await api.post('/payment/failed', {
      orderId,
      gatewayId,
      error
    });
  } catch {
    return null;
  }
  return true;
};

export const openGatewayCheckout = async ({
  gatewayId,
  checkout,
  order,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  if (checkout?.provider === 'instant-test') {
    const confirmed = window.confirm(
      `MarketLoop is running ${gatewayId} in simulated mode. Press OK to simulate a successful payment, or Cancel to stay on checkout.`
    );

    if (!confirmed) {
      await onDismiss?.();
      return order;
    }

    await onSuccess?.({
      simulateStatus: 'success',
      gatewayOrderId: order?.gatewayOrderId || checkout?.gatewayOrderId,
      gatewayPaymentId: `${gatewayId}_SIM_${Date.now()}`
    });
    return order;
  }

  if (checkout?.provider === 'redirect-form') {
    submitPayuCheckout(checkout);
    return order;
  }

  if (checkout?.provider === 'cashfree') {
    await openCashfreeHostedCheckout({
      paymentSessionId: checkout.paymentSessionId,
      returnUrl: checkout.returnUrl,
      mode: checkout.mode || 'sandbox'
    });
    return order;
  }

  if (checkout?.provider === 'redirect-url') {
    if (!checkout?.url) {
      throw new Error('The selected payment gateway did not return a valid redirect URL.');
    }
    window.location.assign(checkout.url);
    return order;
  }

  if (checkout?.provider !== 'razorpay') {
    throw new Error('The selected payment gateway is not available for web checkout right now.');
  }

  await loadRazorpayCheckout();

  if (!window.Razorpay) {
    throw new Error('Razorpay checkout is unavailable right now. Please refresh and try again.');
  }

  const razorpay = new window.Razorpay({
    ...checkout,
    image: '/favicon.svg',
    theme: { color: '#16a34a' },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss
    }
  });

  razorpay.on('payment.failed', onFailure);
  razorpay.open();

  return order;
};

export const createRazorpayOrder = ({ productId, quantity = 1 }) => createCheckoutOrder({ productId, quantity, gatewayId: 'razorpay_checkout' });

export const verifyRazorpayPayment = ({ orderId, payload }) => verifyCheckoutPayment({
  gatewayId: 'razorpay_checkout',
  orderId,
  payload
});

export const recordFailedRazorpayPayment = ({ orderId, error }) => recordFailedCheckoutPayment({
  orderId,
  gatewayId: 'razorpay_checkout',
  error
});
