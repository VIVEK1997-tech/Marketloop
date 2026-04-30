import { createSha512Hash, safeSignatureCompare } from './paymentHash.js';

const PAYU_ENVIRONMENTS = {
  test: 'https://test.payu.in',
  live: 'https://secure.payu.in'
};

const PAYU_GATEWAYS = {
  primary: {
    keyEnv: 'PAYU_MERCHANT_KEY',
    saltEnv: 'PAYU_MERCHANT_SALT',
    keyAliasEnv: 'PAYU_KEY',
    saltAliasEnv: 'PAYU_SALT'
  },
  secondary: {
    keyEnv: 'PAYU_SECOND_MERCHANT_KEY',
    saltEnv: 'PAYU_SECOND_MERCHANT_SALT'
  }
};

const normalizeBaseUrl = (value) => String(value || '').trim().replace(/\/+$/, '');

const detectPayuEnvFromUrl = (url) => {
  const normalizedUrl = normalizeBaseUrl(url);
  if (!normalizedUrl) return '';
  if (normalizedUrl.includes('test.payu.in')) return 'test';
  if (normalizedUrl.includes('secure.payu.in')) return 'live';
  return '';
};

const resolvePayuEnvironmentConfig = () => {
  const configuredEnv = String(process.env.PAYU_ENV || '').trim().toLowerCase();
  const configuredBaseUrl = normalizeBaseUrl(process.env.PAYU_BASE_URL);
  const configuredPaymentUrl = normalizeBaseUrl(process.env.PAYU_PAYMENT_URL);
  const derivedBaseUrl = configuredBaseUrl || configuredPaymentUrl.replace(/\/_payment$/, '');
  const derivedEnv = configuredEnv || detectPayuEnvFromUrl(derivedBaseUrl || configuredPaymentUrl);

  if (!derivedEnv || !PAYU_ENVIRONMENTS[derivedEnv]) {
    const error = new Error('PayU environment is not configured. Set PAYU_ENV to test or live, and provide PAYU_BASE_URL or PAYU_PAYMENT_URL in backend/.env.');
    error.statusCode = 503;
    throw error;
  }

  const expectedBaseUrl = PAYU_ENVIRONMENTS[derivedEnv];
  const finalBaseUrl = derivedBaseUrl || expectedBaseUrl;
  const finalPaymentUrl = configuredPaymentUrl || `${finalBaseUrl}/_payment`;

  if (normalizeBaseUrl(finalBaseUrl) !== expectedBaseUrl || !finalPaymentUrl.startsWith(`${expectedBaseUrl}/_payment`)) {
    const error = new Error(`PayU configuration mismatch. PAYU_ENV=${derivedEnv} must use ${expectedBaseUrl}/_payment.`);
    error.statusCode = 503;
    throw error;
  }

  return {
    env: derivedEnv,
    baseUrl: expectedBaseUrl,
    paymentUrl: `${expectedBaseUrl}/_payment`
  };
};

export const getPayuGatewayName = (requestedGateway) => {
  const gateway = requestedGateway || process.env.PAYU_ACTIVE_GATEWAY || 'primary';
  return gateway === 'secondary' ? 'secondary' : 'primary';
};

export const getPayuGatewayConfig = (requestedGateway) => {
  const gateway = getPayuGatewayName(requestedGateway);
  const envNames = PAYU_GATEWAYS[gateway];
  const key = process.env[envNames.keyEnv] || (envNames.keyAliasEnv ? process.env[envNames.keyAliasEnv] : '');
  const salt = process.env[envNames.saltEnv] || (envNames.saltAliasEnv ? process.env[envNames.saltAliasEnv] : '');
  const { env, baseUrl, paymentUrl } = resolvePayuEnvironmentConfig();

  if (!key || !salt) {
    if (gateway === 'secondary') {
      const primaryEnvNames = PAYU_GATEWAYS.primary;
      const primaryKey = process.env[primaryEnvNames.keyEnv] || process.env[primaryEnvNames.keyAliasEnv];
      const primarySalt = process.env[primaryEnvNames.saltEnv] || process.env[primaryEnvNames.saltAliasEnv];

      if (primaryKey && primarySalt) {
        return { gateway: 'primary', key: primaryKey, salt: primarySalt, paymentUrl, env, baseUrl };
      }
    }

    const aliasHint = envNames.keyAliasEnv && envNames.saltAliasEnv
      ? ` (or ${envNames.keyAliasEnv} and ${envNames.saltAliasEnv})`
      : '';
    const error = new Error(`PayU ${gateway} gateway is not configured. Add ${envNames.keyEnv} and ${envNames.saltEnv}${aliasHint} in backend/.env.`);
    error.statusCode = 503;
    throw error;
  }

  return { gateway, key, salt, paymentUrl, env, baseUrl };
};

export const buildPayuPaymentHash = ({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
  udf6 = '',
  udf7 = '',
  udf8 = '',
  udf9 = '',
  udf10 = '',
  salt
}) => {
  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    udf6,
    udf7,
    udf8,
    udf9,
    udf10,
    salt
  ].join('|');

  return createSha512Hash(hashString);
};

export const buildPayuResponseHash = ({
  salt,
  status,
  email,
  firstname,
  productinfo,
  amount,
  txnid,
  key,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
  udf6 = '',
  udf7 = '',
  udf8 = '',
  udf9 = '',
  udf10 = '',
  additionalCharges
}) => {
  const baseParts = [
    salt,
    status,
    udf10,
    udf9,
    udf8,
    udf7,
    udf6,
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key
  ];

  const hashString = additionalCharges ? [additionalCharges, ...baseParts].join('|') : baseParts.join('|');
  return createSha512Hash(hashString);
};

export const verifyPayuResponseHash = ({ payload, key, salt }) => {
  const expectedHash = buildPayuResponseHash({
    salt,
    status: payload.status,
    email: payload.email,
    firstname: payload.firstname,
    productinfo: payload.productinfo,
    amount: payload.amount,
    txnid: payload.txnid,
    key,
    udf1: payload.udf1,
    udf2: payload.udf2,
    udf3: payload.udf3,
    udf4: payload.udf4,
    udf5: payload.udf5,
    udf6: payload.udf6,
    udf7: payload.udf7,
    udf8: payload.udf8,
    udf9: payload.udf9,
    udf10: payload.udf10,
    additionalCharges: payload.additionalCharges
  });

  return safeSignatureCompare(expectedHash, payload.hash);
};

export const getPublicPayuConfig = ({ gateway, key, paymentUrl }) => ({
  gateway,
  key,
  paymentUrl
});
