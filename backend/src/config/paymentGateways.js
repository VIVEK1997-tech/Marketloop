const defineGateway = ({
  id,
  company,
  type,
  purpose = 'checkout',
  implementationStatus = 'placeholder',
  liveSupported = false,
  testSupported = false,
  requiredEnv = [],
  requiredEnvGroups = [],
  supportedPaymentModes,
  unsupportedModeMessage,
  adapterKey
}) => ({
  id,
  company,
  type,
  purpose,
  implementationStatus,
  liveSupported,
  testSupported,
  requiredEnv,
  requiredEnvGroups,
  supportedPaymentModes,
  unsupportedModeMessage,
  adapterKey: adapterKey || id
});

export const paymentGateways = [
  defineGateway({
    id: 'razorpay_checkout',
    company: 'Razorpay',
    type: 'checkout',
    implementationStatus: 'full',
    liveSupported: true,
    testSupported: true,
    requiredEnv: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    adapterKey: 'razorpay_checkout'
  }),
  defineGateway({
    id: 'razorpay_upi',
    company: 'Razorpay',
    type: 'upi',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({
    id: 'razorpayx_payouts',
    company: 'Razorpay',
    type: 'payouts',
    purpose: 'payout',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({
    id: 'cashfree_payments',
    company: 'Cashfree Payments',
    type: 'checkout',
    implementationStatus: 'full',
    liveSupported: true,
    testSupported: true,
    requiredEnv: ['CASHFREE_CLIENT_ID', 'CASHFREE_CLIENT_SECRET', 'CASHFREE_ENV', 'CASHFREE_API_VERSION', 'CASHFREE_RETURN_URL'],
    adapterKey: 'cashfree_payments'
  }),
  defineGateway({
    id: 'cashfree_payouts',
    company: 'Cashfree Payments',
    type: 'payouts',
    purpose: 'payout',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({
    id: 'payu_india',
    company: 'PayU India',
    type: 'checkout',
    implementationStatus: 'full',
    liveSupported: true,
    testSupported: true,
    requiredEnvGroups: [
      { label: 'PAYU_ENV', keys: ['PAYU_ENV'] },
      { label: 'PAYU_KEY', keys: ['PAYU_KEY', 'PAYU_MERCHANT_KEY'] },
      { label: 'PAYU_SALT', keys: ['PAYU_SALT', 'PAYU_MERCHANT_SALT'] }
    ],
    adapterKey: 'payu_india'
  }),
  defineGateway({
    id: 'phonepe_pg',
    company: 'PhonePe Payment Gateway',
    type: 'checkout',
    implementationStatus: 'full',
    liveSupported: true,
    testSupported: true,
    supportedPaymentModes: ['test', 'live'],
    requiredEnv: ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX', 'PHONEPE_ENV'],
    adapterKey: 'phonepe_pg'
  }),
  defineGateway({
    id: 'phonepe_upi',
    company: 'PhonePe Payment Gateway',
    type: 'upi',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({
    id: 'paytm_pg',
    company: 'Paytm Payment Gateway',
    type: 'checkout',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({
    id: 'paytm_upi',
    company: 'Paytm Payment Gateway',
    type: 'upi',
    implementationStatus: 'placeholder',
    liveSupported: false,
    testSupported: false
  }),
  defineGateway({ id: 'ccavenue', company: 'CCAvenue', type: 'checkout' }),
  defineGateway({ id: 'billdesk', company: 'BillDesk', type: 'checkout' }),
  defineGateway({
    id: 'hdfc_smartgateway',
    company: 'HDFC SmartGateway',
    type: 'checkout',
    implementationStatus: 'test',
    liveSupported: false,
    testSupported: true,
    supportedPaymentModes: ['test'],
    unsupportedModeMessage: 'HDFC SmartGateway is configured for sandbox only. Set PAYMENT_MODE=test or HDFC_ENV=test to enable test checkout.',
    requiredEnvGroups: [
      { label: 'HDFC_ENV', keys: ['HDFC_ENV'] },
      { label: 'HDFC_SMARTGATEWAY_MERCHANT_ID', keys: ['HDFC_SMARTGATEWAY_MERCHANT_ID', 'HDFC_MERCHANT_ID'] },
      { label: 'HDFC_SMARTGATEWAY_API_KEY', keys: ['HDFC_SMARTGATEWAY_API_KEY', 'HDFC_API_KEY'] },
      { label: 'HDFC_SMARTGATEWAY_SECRET_KEY', keys: ['HDFC_SMARTGATEWAY_SECRET_KEY', 'HDFC_SECRET_KEY'] },
      { label: 'HDFC_SMARTGATEWAY_SESSION_API_URL', keys: ['HDFC_SMARTGATEWAY_SESSION_API_URL', 'HDFC_SESSION_API_URL'] },
      { label: 'HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL', keys: ['HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL', 'HDFC_ORDER_STATUS_API_URL'] },
      { label: 'HDFC_SMARTGATEWAY_RETURN_URL', keys: ['HDFC_SMARTGATEWAY_RETURN_URL', 'HDFC_RETURN_URL'] }
    ],
    adapterKey: 'hdfc_smartgateway'
  }),
  defineGateway({ id: 'icici_payment_gateway', company: 'ICICI Payment Gateway', type: 'checkout' }),
  defineGateway({ id: 'atom_paynet', company: 'Atom Paynet', type: 'checkout' }),
  defineGateway({
    id: 'paypal_india',
    company: 'PayPal India',
    type: 'checkout',
    implementationStatus: 'test',
    liveSupported: false,
    testSupported: true,
    requiredEnv: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
    adapterKey: 'paypal_india'
  }),
  defineGateway({
    id: 'stripe',
    company: 'Stripe',
    type: 'checkout',
    implementationStatus: 'test',
    liveSupported: false,
    testSupported: true,
    requiredEnv: ['STRIPE_SECRET_KEY'],
    adapterKey: 'stripe'
  }),
  defineGateway({ id: 'payglocal', company: 'PayGlocal', type: 'checkout' }),
  defineGateway({ id: 'skydo', company: 'Skydo', type: 'checkout' }),
  defineGateway({ id: 'instamojo', company: 'Instamojo', type: 'checkout' }),
  defineGateway({ id: 'paykun', company: 'PayKun', type: 'checkout' }),
  defineGateway({ id: 'zaakpay', company: 'Zaakpay', type: 'checkout' }),
  defineGateway({ id: 'mobikwik', company: 'MobiKwik', type: 'checkout' }),
  defineGateway({ id: 'pine_labs', company: 'Pine Labs', type: 'checkout' }),
  defineGateway({ id: 'cred_pay', company: 'Cred Pay', type: 'checkout' }),
  defineGateway({ id: 'bharatpe', company: 'BharatPe', type: 'checkout' }),
  defineGateway({ id: 'airpay', company: 'Airpay', type: 'checkout' }),
  defineGateway({ id: 'ippopay', company: 'IppoPay', type: 'checkout' }),
  defineGateway({ id: 'mintoak', company: 'Mintoak', type: 'checkout' }),
  defineGateway({ id: 'easebuzz', company: 'Easebuzz', type: 'checkout' }),
  defineGateway({ id: 'juspay', company: 'Juspay', type: 'checkout' })
];

export const paymentGatewayMap = new Map(paymentGateways.map((gateway) => [gateway.id, gateway]));

export const getGatewayDefinition = (gatewayId) => paymentGatewayMap.get(gatewayId) || null;

export const legacyGatewayAliases = {
  razorpay: 'razorpay_checkout',
  payu: 'payu_india',
  phonepe: 'phonepe_pg',
  cashfree: 'cashfree_payments',
  hdfc: 'hdfc_smartgateway',
  primary: 'payu_india',
  secondary: 'payu_india'
};

export const normalizeGatewayId = (value) => {
  if (!value) return '';
  return legacyGatewayAliases[value] || value;
};
