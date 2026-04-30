import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPaymentError } from './payments/errors.js';
import { safeSignatureCompare } from '../utils/paymentHash.js';

const DEFAULT_SESSION_API_URL = 'https://smartgateway.hdfcuat.bank.in/v4/session';
const DEFAULT_ORDER_STATUS_API_URL = 'https://smartgateway.hdfcuat.bank.in/orders/:orderId';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_HDFC_CONFIG_PATH = path.resolve(__dirname, '../../config/hdfc-smartgateway.config.json');

const normalizeUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
const normalizeSecret = (value) => String(value || '').trim();
const isPlaceholderValue = (value) => {
  const normalized = normalizeSecret(value);
  if (!normalized) return true;
  if (normalized.includes('*')) return true;
  return [
    'replace_with_hdfc_api_key',
    'replace_with_hdfc_merchant_id',
    'replace_with_hdfc_response_key',
    'your_hdfc_api_key',
    'your_hdfc_merchant_id',
    'your_hdfc_secret_key'
  ].includes(normalized.toLowerCase());
};

const coerceBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const extractNestedValue = (payload, paths = []) => {
  for (const path of paths) {
    const result = path.split('.').reduce((accumulator, key) => (
      accumulator && accumulator[key] !== undefined ? accumulator[key] : undefined
    ), payload);
    if (result !== undefined && result !== null && result !== '') return result;
  }
  return undefined;
};

const loadLocalHdfcConfig = () => {
  const configPath = String(process.env.HDFC_SMARTGATEWAY_CONFIG_PATH || DEFAULT_HDFC_CONFIG_PATH).trim();
  if (!configPath || !fs.existsSync(configPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = Number(process.env.HDFC_REQUEST_TIMEOUT_MS || 12000)) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createPaymentError(
        'HDFC SmartGateway sandbox did not respond in time. Check your sandbox credentials or switch to HDFC mock mode for local testing.',
        504,
        'HDFC_REQUEST_TIMEOUT'
      );
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

export const getHdfcConfig = () => {
  const fileConfig = loadLocalHdfcConfig();
  const env = String(process.env.HDFC_ENV || 'test').trim().toLowerCase();
  const baseUrl = normalizeUrl(fileConfig.BASE_URL || '');
  const sessionApiUrl = normalizeUrl(
    process.env.HDFC_SMARTGATEWAY_SESSION_API_URL
    || process.env.HDFC_SESSION_API_URL
    || (baseUrl ? `${baseUrl}/v4/session` : '')
    || DEFAULT_SESSION_API_URL
  );
  const orderStatusApiUrl = normalizeUrl(
    process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL
    || process.env.HDFC_ORDER_STATUS_API_URL
    || (baseUrl ? `${baseUrl}/orders/:orderId` : '')
    || DEFAULT_ORDER_STATUS_API_URL
  );
  const explicitMockMode = coerceBoolean(process.env.HDFC_MOCK_MODE, false);
  const rawMerchantId = String(process.env.HDFC_SMARTGATEWAY_MERCHANT_ID || process.env.HDFC_MERCHANT_ID || fileConfig.MERCHANT_ID || '').trim();
  const rawApiKey = String(process.env.HDFC_SMARTGATEWAY_API_KEY || process.env.HDFC_API_KEY || fileConfig.API_KEY || '').trim();
  const rawSecretKey = String(process.env.HDFC_SMARTGATEWAY_SECRET_KEY || process.env.HDFC_SECRET_KEY || fileConfig.RESPONSE_KEY || '').trim();
  const merchantId = isPlaceholderValue(rawMerchantId) ? '' : rawMerchantId;
  const apiKey = isPlaceholderValue(rawApiKey) ? '' : rawApiKey;
  const secretKey = isPlaceholderValue(rawSecretKey) ? '' : rawSecretKey;
  const returnUrl = normalizeUrl(
    process.env.HDFC_SMARTGATEWAY_RETURN_URL
    || process.env.HDFC_RETURN_URL
    || 'http://localhost:5173/payment/hdfc/return'
  );

  return {
    env,
    merchantId,
    resellerId: String(process.env.HDFC_RESELLER_ID || '').trim(),
    apiKey,
    secretKey,
    sessionApiUrl,
    orderStatusApiUrl,
    returnUrl,
    paymentPageClientId: String(process.env.HDFC_PAYMENT_PAGE_CLIENT_ID || fileConfig.PAYMENT_PAGE_CLIENT_ID || 'hdfcmaster').trim(),
    enableLogging: coerceBoolean(process.env.HDFC_ENABLE_LOGGING, fileConfig.ENABLE_LOGGING),
    configPath: fs.existsSync(String(process.env.HDFC_SMARTGATEWAY_CONFIG_PATH || DEFAULT_HDFC_CONFIG_PATH).trim())
      ? String(process.env.HDFC_SMARTGATEWAY_CONFIG_PATH || DEFAULT_HDFC_CONFIG_PATH).trim()
      : '',
    webhookSecret: String(process.env.HDFC_WEBHOOK_SECRET || process.env.HDFC_SMARTGATEWAY_SECRET_KEY || process.env.HDFC_SECRET_KEY || fileConfig.RESPONSE_KEY || '').trim(),
    mockMode: explicitMockMode || ((env === 'test') && (!merchantId || !apiKey || !secretKey))
  };
};

export const generateChecksum = (payload, secretKey = getHdfcConfig().secretKey) => {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  return crypto
    .createHash('sha256')
    .update(`${serialized}|${secretKey}`)
    .digest('hex');
};

const parseJsonResponse = async (response) => {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    return { rawText };
  }
};

const buildMockPaymentLink = ({
  clientBaseUrl,
  localOrderId,
  merchantOrderId,
  gatewayOrderId,
  amount,
  currency,
  returnUrl
}) => {
  const url = new URL('/payment/hdfc/mock-gateway', clientBaseUrl);
  url.searchParams.set('localOrderId', String(localOrderId));
  url.searchParams.set('merchantOrderId', String(merchantOrderId));
  url.searchParams.set('gatewayOrderId', String(gatewayOrderId));
  url.searchParams.set('amount', String(amount));
  url.searchParams.set('currency', String(currency || 'INR'));
  url.searchParams.set('returnUrl', String(returnUrl));
  return url.toString();
};

const buildMockSessionResponse = ({
  clientBaseUrl,
  merchantOrderId,
  gatewayOrderId,
  amount,
  currency,
  returnUrl,
  localOrderId,
  fallbackReason = ''
}) => {
  const paymentLink = buildMockPaymentLink({
    clientBaseUrl,
    localOrderId,
    merchantOrderId,
    gatewayOrderId,
    amount,
    currency,
    returnUrl
  });

  return {
    status: 'payment_link_generated',
    session_id: `HDFC_SESSION_${gatewayOrderId}`,
    order_id: merchantOrderId,
    gateway_order_id: gatewayOrderId,
    payment_link: paymentLink,
    mock: true,
    raw: {
      payment_link: paymentLink,
      order_id: merchantOrderId,
      fallbackReason
    }
  };
};

const buildSessionRequestPayload = ({
  merchantOrderId,
  gatewayOrderId,
  amount,
  currency,
  customer,
  returnUrl,
  orderNote,
  metadata = {}
}) => ({
  order_id: merchantOrderId,
  amount: Number(amount).toFixed(2),
  currency: String(currency || 'INR').toUpperCase(),
  customer_id: String(customer.id || customer.customerId || ''),
  customer_email: customer.email || '',
  customer_phone: customer.phone || '',
  first_name: customer.name || '',
  description: orderNote || 'Complete your payment',
  payment_page_client_id: getHdfcConfig().paymentPageClientId || getHdfcConfig().merchantId,
  action: 'paymentPage',
  return_url: returnUrl,
  meta: {
    gateway_order_id: gatewayOrderId,
    note: orderNote || '',
    ...metadata
  }
  // If your HDFC sandbox account expects different field names, adjust this object
  // to mirror the exact Session API contract provided for your merchant profile.
});

const buildStatusUrl = ({ baseUrl, merchantOrderId, gatewayOrderId }) => {
  if (baseUrl.includes(':orderId')) {
    return baseUrl.replace(':orderId', encodeURIComponent(gatewayOrderId || merchantOrderId));
  }

  const url = new URL(baseUrl);
  if (gatewayOrderId) url.searchParams.set('gateway_order_id', String(gatewayOrderId));
  if (merchantOrderId) url.searchParams.set('order_id', String(merchantOrderId));
  return url.toString();
};

const buildSessionHeaders = (payload) => {
  const config = getHdfcConfig();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-merchantid': config.merchantId,
    'x-customerid': String(payload?.customer_id || ''),
    ...(config.resellerId ? { 'x-resellerid': config.resellerId } : {}),
    'x-api-key': config.apiKey,
    'x-signature': generateChecksum(payload, config.secretKey),
    'Authorization': `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`
    // SmartGateway merchant setups can vary. If your sandbox account requires the
    // encrypted JWT body flow from the merchant docs, replace this plain JSON request
    // with the signed/encrypted payload expected for your account.
  };
};

const buildStatusHeaders = ({ merchantOrderId, gatewayOrderId }) => {
  const config = getHdfcConfig();
  const signaturePayload = { merchantOrderId, gatewayOrderId };
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-routing-id': String(merchantOrderId || gatewayOrderId || ''),
    'x-api-key': config.apiKey,
    'x-signature': generateChecksum(signaturePayload, config.secretKey),
    'Authorization': `Basic ${Buffer.from(`${config.apiKey}:`).toString('base64')}`
  };
};

const mapHdfcStatus = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (['charged', 'captured', 'paid', 'success', 'successful', 'payment_successful'].includes(normalized)) return 'success';
  if (['failed', 'failure', 'declined', 'payment_failed'].includes(normalized)) return 'failed';
  if (['created', 'payment_link_generated'].includes(normalized)) return normalized;
  return 'pending';
};

const extractPaymentLink = (payload) => extractNestedValue(payload, [
  'payment_link',
  'payment_links',
  'paymentLink',
  'payment_url',
  'paymentUrl',
  'links.payment',
  'links.redirect',
  'data.payment_link',
  'data.paymentLink',
  'sdk_payload.payment_link',
  'sdk_payload.payment_url'
]);

const extractGatewayPaymentId = (payload) => extractNestedValue(payload, [
  'payment_id',
  'paymentId',
  'transaction_id',
  'transactionId',
  'data.payment_id',
  'data.transaction_id',
  'data.transactionId'
]);

export const createOrder = async ({
  merchantOrderId,
  gatewayOrderId,
  amount,
  currency = 'INR',
  customer = {},
  returnUrl,
  clientBaseUrl,
  orderNote = '',
  metadata = {},
  fetchImpl = fetchWithTimeout
}) => {
  const config = getHdfcConfig();
  const requestPayload = buildSessionRequestPayload({
    merchantOrderId,
    gatewayOrderId,
    amount,
    currency,
    customer,
    returnUrl,
    orderNote,
    metadata
  });

  if (config.mockMode) {
    return buildMockSessionResponse({
      clientBaseUrl,
      merchantOrderId,
      gatewayOrderId,
      amount,
      currency,
      returnUrl,
      localOrderId: metadata.localOrderId
    });
  }

  let response;
  try {
    response = await fetchImpl(config.sessionApiUrl, {
      method: 'POST',
      headers: buildSessionHeaders(requestPayload),
      body: JSON.stringify(requestPayload)
    });
  } catch (error) {
    if (config.env === 'test') {
      if (config.enableLogging || process.env.NODE_ENV !== 'production') {
        console.warn('[HDFC] Falling back to mock checkout because sandbox session request failed:', error?.message || error);
      }
      return buildMockSessionResponse({
        clientBaseUrl,
        merchantOrderId,
        gatewayOrderId,
        amount,
        currency,
        returnUrl,
        localOrderId: metadata.localOrderId,
        fallbackReason: error?.message || 'sandbox_fetch_failed'
      });
    }
    throw error;
  }

  const body = await parseJsonResponse(response);
  if (!response.ok) {
    if (config.env === 'test') {
      if (config.enableLogging || process.env.NODE_ENV !== 'production') {
        console.warn('[HDFC] Falling back to mock checkout because sandbox session response was not OK:', body);
      }
      return buildMockSessionResponse({
        clientBaseUrl,
        merchantOrderId,
        gatewayOrderId,
        amount,
        currency,
        returnUrl,
        localOrderId: metadata.localOrderId,
        fallbackReason: body?.message || body?.error || `http_${response.status || 502}`
      });
    }
    throw createPaymentError(
      body?.message || body?.error || 'HDFC SmartGateway session creation failed.',
      response.status || 502,
      'HDFC_SESSION_CREATE_FAILED',
      body
    );
  }

  const paymentLink = extractPaymentLink(body);
  if (!paymentLink) {
    if (config.env === 'test') {
      if (config.enableLogging || process.env.NODE_ENV !== 'production') {
        console.warn('[HDFC] Falling back to mock checkout because sandbox response had no payment link:', body);
      }
      return buildMockSessionResponse({
        clientBaseUrl,
        merchantOrderId,
        gatewayOrderId,
        amount,
        currency,
        returnUrl,
        localOrderId: metadata.localOrderId,
        fallbackReason: 'missing_payment_link'
      });
    }
    throw createPaymentError(
      'HDFC SmartGateway did not return a payment link.',
      502,
      'HDFC_PAYMENT_LINK_MISSING',
      body
    );
  }

  return {
    status: 'payment_link_generated',
    session_id: extractNestedValue(body, ['session_id', 'sessionId', 'data.session_id']),
    order_id: merchantOrderId,
    gateway_order_id: gatewayOrderId,
    payment_link: paymentLink,
    mock: false,
    raw: body
  };
};

export const getPaymentStatus = async ({
  merchantOrderId,
  gatewayOrderId,
  mockStatus,
  mockTxnId,
  forceMockMode = false,
  fetchImpl = fetchWithTimeout
}) => {
  const config = getHdfcConfig();
  const useMockMode = Boolean(forceMockMode || config.mockMode);

  if (useMockMode) {
    const status = mapHdfcStatus(mockStatus || 'pending');
    return {
      status,
      successful: status === 'success',
      order_id: merchantOrderId,
      gateway_order_id: gatewayOrderId,
      payment_id: mockTxnId || `HDFC_PAY_${gatewayOrderId || merchantOrderId}`,
      raw: {
        status,
        payment_id: mockTxnId || `HDFC_PAY_${gatewayOrderId || merchantOrderId}`,
        mock: true
      }
    };
  }

  const statusUrl = buildStatusUrl({
    baseUrl: config.orderStatusApiUrl,
    merchantOrderId,
    gatewayOrderId
  });

  const response = await fetchImpl(statusUrl, {
    method: 'GET',
    headers: buildStatusHeaders({ merchantOrderId, gatewayOrderId })
  });

  const body = await parseJsonResponse(response);
  if (!response.ok) {
    throw createPaymentError(
      body?.message || body?.error || 'HDFC SmartGateway order status lookup failed.',
      response.status || 502,
      'HDFC_ORDER_STATUS_FAILED',
      body
    );
  }

  const status = mapHdfcStatus(
    extractNestedValue(body, [
      'status',
      'order_status',
      'payment_status',
      'data.status',
      'data.order_status',
      'order.state'
    ])
  );

  return {
    status,
    successful: status === 'success',
    order_id: merchantOrderId,
    gateway_order_id: gatewayOrderId,
    payment_id: extractGatewayPaymentId(body) || '',
    raw: body
  };
};

export const verifyPayment = async ({
  merchantOrderId,
  gatewayOrderId,
  payload = {},
  forceMockMode = false,
  fetchImpl = fetchWithTimeout
}) => getPaymentStatus({
  merchantOrderId,
  gatewayOrderId,
  mockStatus: payload.mockStatus,
  mockTxnId: payload.mockTxnId,
  forceMockMode,
  fetchImpl
});

export const handleWebhook = async (
  payload = {},
  headers = {},
  rawBody = '',
  fetchImpl = fetchWithTimeout,
  forceMockMode = false
) => {
  const config = getHdfcConfig();
  const receivedSignature = headers['x-hdfc-signature'] || headers['x-signature'] || '';
  const useMockMode = Boolean(forceMockMode || config.mockMode);
  if (!useMockMode && config.webhookSecret && receivedSignature) {
    const expectedSignature = generateChecksum(
      typeof rawBody === 'string' && rawBody ? rawBody : JSON.stringify(payload || {}),
      config.webhookSecret
    );

    if (!safeSignatureCompare(expectedSignature, receivedSignature)) {
      throw createPaymentError('Invalid HDFC webhook signature.', 400, 'HDFC_INVALID_WEBHOOK_SIGNATURE');
    }
  }

  const merchantOrderId = extractNestedValue(payload, ['order_id', 'orderId', 'merchant_order_id']);
  const gatewayOrderId = extractNestedValue(payload, ['gateway_order_id', 'gatewayOrderId', 'session_id']);
  return verifyPayment({
    merchantOrderId,
    gatewayOrderId,
    payload,
    forceMockMode: useMockMode,
    fetchImpl
  });
};

export const refundPayment = async ({ paymentId, amount }) => ({
  refundId: `HDFC_REFUND_${paymentId || Date.now()}`,
  status: 'pending',
  amount,
  raw: {
    note: 'HDFC SmartGateway refund API is not implemented in this sandbox integration yet.'
  }
});
