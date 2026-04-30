import crypto from 'crypto';

export const parseCsv = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const normalizeGatewayKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');

export const generateReceipt = (productId, userId) =>
  `ml_${String(productId).slice(-6)}_${String(userId).slice(-6)}_${Date.now()}`;

export const generateReference = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`.toUpperCase();

export const generateIdempotencyKey = (gatewayId, orderId, suffix = '') =>
  `${gatewayId}:${String(orderId)}:${suffix || crypto.randomUUID()}`;

export const sanitizePayload = (payload = {}) => {
  if (!payload || typeof payload !== 'object') return payload;
  const secretPattern = /(secret|salt|signature|token|authorization|password|key)/i;
  return Object.entries(payload).reduce((accumulator, [key, value]) => {
    accumulator[key] = secretPattern.test(key) ? '[REDACTED]' : value;
    return accumulator;
  }, {});
};

export const mapPaymentStatus = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['captured', 'success', 'successful', 'paid'].includes(normalized)) return 'success';
  if (['authorized', 'authorised'].includes(normalized)) return 'authorized';
  if (['refunded'].includes(normalized)) return 'refunded';
  if (['partially_refunded', 'partial_refund'].includes(normalized)) return 'partially_refunded';
  if (['failed', 'failure', 'cancelled'].includes(normalized)) return 'failed';
  return 'pending';
};

export const buildDisplayGatewayLabel = (gatewayId) =>
  String(gatewayId || '')
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

const normalizeUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
const isLoopbackHost = (hostname) => ['localhost', '127.0.0.1', '::1'].includes(String(hostname || '').trim().toLowerCase());

export const resolveClientAppUrl = (requestContext = {}) => {
  const explicitBaseUrl = normalizeUrl(process.env.MOBILE_BRIDGE_BASE_URL || process.env.FRONTEND_PUBLIC_URL || process.env.CLIENT_URL);
  const fallbackPort = (() => {
    if (!explicitBaseUrl) return '5173';
    try {
      const parsed = new URL(explicitBaseUrl);
      return parsed.port || '5173';
    } catch {
      return '5173';
    }
  })();

  if (explicitBaseUrl) {
    try {
      const parsed = new URL(explicitBaseUrl);
      if (!isLoopbackHost(parsed.hostname)) {
        return normalizeUrl(parsed.toString());
      }
    } catch {
      return explicitBaseUrl;
    }
  }

  const candidateHost = requestContext.origin || requestContext.host || '';
  if (candidateHost) {
    try {
      const parsed = new URL(candidateHost.startsWith('http') ? candidateHost : `${requestContext.protocol || 'http'}://${candidateHost}`);
      if (!isLoopbackHost(parsed.hostname)) {
        parsed.port = fallbackPort;
        parsed.pathname = '';
        parsed.search = '';
        parsed.hash = '';
        return normalizeUrl(parsed.toString());
      }
    } catch {
      // ignore invalid request host and fall back to configured localhost URL
    }
  }

  return explicitBaseUrl || 'http://localhost:5173';
};
