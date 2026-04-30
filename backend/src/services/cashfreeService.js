import crypto from 'crypto';
import { createPaymentError } from './payments/errors.js';

const DEFAULT_SANDBOX_BASE_URL = 'https://sandbox.cashfree.com/pg';
const DEFAULT_PRODUCTION_BASE_URL = 'https://api.cashfree.com/pg';

const normalizeBaseUrl = (value) => String(value || '').replace(/\/+$/, '');

export const getCashfreeConfig = () => {
  const env = String(process.env.CASHFREE_ENV || 'sandbox').trim().toLowerCase();
  const clientId = String(process.env.CASHFREE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.CASHFREE_CLIENT_SECRET || '').trim();
  const apiVersion = String(process.env.CASHFREE_API_VERSION || '2023-08-01').trim();
  const returnUrl = String(process.env.CASHFREE_RETURN_URL || '').trim();
  const webhookSecret = String(process.env.CASHFREE_WEBHOOK_SECRET || '').trim();
  const baseUrl = normalizeBaseUrl(
    process.env.CASHFREE_BASE_URL || (env === 'production' ? DEFAULT_PRODUCTION_BASE_URL : DEFAULT_SANDBOX_BASE_URL)
  );

  return {
    env,
    clientId,
    clientSecret,
    apiVersion,
    returnUrl,
    webhookSecret,
    baseUrl
  };
};

const ensureConfigured = () => {
  const config = getCashfreeConfig();
  if (!config.clientId || !config.clientSecret) {
    throw createPaymentError(
      'Cashfree is not configured. Add CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET to the backend environment.',
      503,
      'CASHFREE_NOT_CONFIGURED'
    );
  }
  return config;
};

const requestCashfree = async ({ path, method = 'GET', body, idempotencyKey }) => {
  const config = ensureConfigured();
  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-client-id': config.clientId,
      'x-client-secret': config.clientSecret,
      'x-api-version': config.apiVersion,
      ...(idempotencyKey ? { 'x-idempotency-key': idempotencyKey } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw createPaymentError(
      data?.message || data?.error || 'Cashfree request failed.',
      response.status,
      'CASHFREE_API_ERROR',
      data
    );
  }

  return data;
};

export const createOrder = async (orderData) => {
  return requestCashfree({
    path: '/orders',
    method: 'POST',
    body: orderData,
    idempotencyKey: orderData?.order_id
  });
};

export const verifyPayment = async (orderId) => {
  if (!orderId) {
    throw createPaymentError('Cashfree order ID is required for verification.', 400, 'CASHFREE_ORDER_ID_REQUIRED');
  }
  return requestCashfree({
    path: `/orders/${encodeURIComponent(orderId)}`,
    method: 'GET'
  });
};

export const getPaymentStatus = async (orderId) => {
  if (!orderId) {
    throw createPaymentError('Cashfree order ID is required for payment status.', 400, 'CASHFREE_ORDER_ID_REQUIRED');
  }
  return requestCashfree({
    path: `/orders/${encodeURIComponent(orderId)}/payments`,
    method: 'GET'
  });
};

export const refundPayment = async (paymentId, amount, refundId) => {
  if (!paymentId) {
    throw createPaymentError('Cashfree payment ID is required for refund.', 400, 'CASHFREE_PAYMENT_ID_REQUIRED');
  }
  return requestCashfree({
    path: `/orders/payments/${encodeURIComponent(paymentId)}/refunds`,
    method: 'POST',
    body: {
      refund_amount: Number(amount),
      refund_id: refundId
    },
    idempotencyKey: refundId
  });
};

export const verifyWebhookSignature = (rawBody, headers = {}) => {
  const { webhookSecret } = getCashfreeConfig();
  if (!webhookSecret) {
    throw createPaymentError('CASHFREE_WEBHOOK_SECRET is not configured.', 503, 'CASHFREE_WEBHOOK_NOT_CONFIGURED');
  }

  const providedSignature = headers['x-webhook-signature'];
  const timestamp = headers['x-webhook-timestamp'];
  if (!providedSignature || !timestamp) {
    throw createPaymentError('Cashfree webhook signature headers are missing.', 400, 'CASHFREE_INVALID_WEBHOOK_HEADERS');
  }

  const normalizedRawBody = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${timestamp}${normalizedRawBody}`)
    .digest('base64');

  if (computedSignature !== String(providedSignature)) {
    throw createPaymentError('Invalid Cashfree webhook signature.', 400, 'CASHFREE_INVALID_WEBHOOK_SIGNATURE');
  }

  return true;
};

export const handleWebhook = async (payload, headers = {}, rawBody = '') => {
  verifyWebhookSignature(rawBody, headers);

  const orderId = payload?.data?.order?.order_id || payload?.order_id || payload?.data?.order_id;
  if (!orderId) {
    return {
      orderId: '',
      order: null,
      payments: []
    };
  }

  const [order, payments] = await Promise.all([
    verifyPayment(orderId),
    getPaymentStatus(orderId).catch(() => [])
  ]);

  return {
    orderId,
    order,
    payments
  };
};
