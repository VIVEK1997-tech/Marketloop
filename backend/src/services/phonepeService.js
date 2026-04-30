import crypto from 'crypto';
import { createPaymentError } from './payments/errors.js';

const DEFAULT_UAT_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const DEFAULT_LIVE_BASE_URL = 'https://api.phonepe.com/apis/hermes';

const normalizeBaseUrl = (value) => String(value || '').replace(/\/+$/, '');

export const getPhonePeConfig = () => {
  const merchantId = String(process.env.PHONEPE_MERCHANT_ID || '').trim();
  const saltKey = String(process.env.PHONEPE_SALT_KEY || '').trim();
  const saltIndex = String(process.env.PHONEPE_SALT_INDEX || '').trim();
  const env = String(process.env.PHONEPE_ENV || 'UAT').trim().toUpperCase();
  const baseUrl = normalizeBaseUrl(
    process.env.PHONEPE_BASE_URL || (env === 'LIVE' ? DEFAULT_LIVE_BASE_URL : DEFAULT_UAT_BASE_URL)
  );

  return {
    merchantId,
    saltKey,
    saltIndex,
    env,
    baseUrl
  };
};

const ensureConfigured = () => {
  const config = getPhonePeConfig();
  if (!config.merchantId || !config.saltKey || !config.saltIndex) {
    throw createPaymentError(
      'PhonePe is not configured. Add PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, and PHONEPE_SALT_INDEX to the backend environment.',
      503,
      'PHONEPE_NOT_CONFIGURED'
    );
  }
  return config;
};

const stringifyBody = (value) => JSON.stringify(value);

export const generateChecksum = (payloadOrEncodedValue, requestPath, { alreadyEncoded = false } = {}) => {
  const { saltKey, saltIndex } = ensureConfigured();
  const encodedPayload = alreadyEncoded
    ? String(payloadOrEncodedValue)
    : Buffer.from(stringifyBody(payloadOrEncodedValue)).toString('base64');
  const checksum = crypto
    .createHash('sha256')
    .update(`${encodedPayload}${requestPath}${saltKey}`)
    .digest('hex');

  return `${checksum}###${saltIndex}`;
};

const performPhonePeRequest = async ({ path, method = 'POST', body, headers = {} }) => {
  const { baseUrl } = ensureConfigured();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers
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
      data?.message || data?.error || 'PhonePe request failed.',
      response.status,
      'PHONEPE_API_ERROR',
      data
    );
  }

  return data;
};

const getMerchantTransactionId = (value) => String(value || '').trim();

export const createPayment = async ({
  merchantTransactionId,
  amountPaise,
  redirectUrl,
  callbackUrl,
  merchantUserId,
  mobileNumber,
  orderId,
  productId,
  buyerId,
  sellerId,
  paymentInstrument = { type: 'PAY_PAGE' }
}) => {
  const { merchantId } = ensureConfigured();
  const requestPath = '/pg/v1/pay';
  const normalizedTransactionId = getMerchantTransactionId(merchantTransactionId);

  if (!normalizedTransactionId) {
    throw createPaymentError('PhonePe transaction ID is required.', 400, 'PHONEPE_TRANSACTION_REQUIRED');
  }

  const amount = Number(amountPaise);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createPaymentError('PhonePe amount must be greater than zero.', 400, 'PHONEPE_INVALID_AMOUNT');
  }

  const payload = {
    merchantId,
    merchantTransactionId: normalizedTransactionId,
    merchantUserId: String(merchantUserId || buyerId || 'marketloop-user'),
    amount: Math.round(amount),
    redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: callbackUrl || redirectUrl,
    mobileNumber: mobileNumber ? String(mobileNumber) : undefined,
    paymentInstrument,
    ...(orderId ? { orderId: String(orderId) } : {}),
    ...(productId ? { productId: String(productId) } : {}),
    ...(buyerId ? { buyerId: String(buyerId) } : {}),
    ...(sellerId ? { sellerId: String(sellerId) } : {})
  };

  const cleanedPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  const encodedPayload = Buffer.from(stringifyBody(cleanedPayload)).toString('base64');
  const checksum = generateChecksum(encodedPayload, requestPath, { alreadyEncoded: true });

  return performPhonePeRequest({
    path: requestPath,
    body: { request: encodedPayload },
    headers: {
      'X-VERIFY': checksum
    }
  });
};

export const verifyPayment = async (transactionId) => {
  const { merchantId, saltKey, saltIndex } = ensureConfigured();
  const normalizedTransactionId = getMerchantTransactionId(transactionId);

  if (!normalizedTransactionId) {
    throw createPaymentError('PhonePe transaction ID is required for verification.', 400, 'PHONEPE_TRANSACTION_REQUIRED');
  }

  const requestPath = `/pg/v1/status/${merchantId}/${normalizedTransactionId}`;
  const checksum = crypto
    .createHash('sha256')
    .update(`${requestPath}${saltKey}`)
    .digest('hex');

  return performPhonePeRequest({
    path: requestPath,
    method: 'GET',
    headers: {
      'X-VERIFY': `${checksum}###${saltIndex}`,
      'X-MERCHANT-ID': merchantId
    }
  });
};

export const handleWebhook = async (data = {}) => {
  const transactionId = getMerchantTransactionId(
    data?.payload?.merchantTransactionId
      || data?.merchantTransactionId
      || data?.transactionId
      || data?.payload?.transactionId
  );

  if (!transactionId) {
    return {
      successful: false,
      status: 'ignored',
      gatewayOrderId: '',
      rawPayload: data
    };
  }

  const verification = await verifyPayment(transactionId);
  return {
    verification,
    transactionId
  };
};
