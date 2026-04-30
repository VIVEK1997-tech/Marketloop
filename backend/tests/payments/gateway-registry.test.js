import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentGatewayRegistry } from '../../src/services/payments/gateway-registry.service.js';
import PaymentGatewaySetting from '../../src/models/PaymentGatewaySetting.js';

const originalEnv = { ...process.env };
const originalFind = PaymentGatewaySetting.find;

test.afterEach(() => {
  process.env = { ...originalEnv };
  PaymentGatewaySetting.find = originalFind;
});

test('single gateway mode resolves only the configured gateway', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'single';
  process.env.PAYMENT_GATEWAY = 'stripe';
  process.env.STRIPE_SECRET_KEY = 'stripe_test_key';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: false });
  assert.equal(gateways.length, 1);
  assert.equal(gateways[0].id, 'stripe');
});

test('multiple gateway mode lists enabled runtime-ready gateways', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'razorpay_checkout,cashfree_payments,pine_labs';
  process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
  process.env.CASHFREE_CLIENT_ID = 'cf_test_client';
  process.env.CASHFREE_CLIENT_SECRET = 'cf_test_secret';
  process.env.CASHFREE_ENV = 'sandbox';
  process.env.CASHFREE_API_VERSION = '2023-08-01';
  process.env.CASHFREE_RETURN_URL = 'http://localhost:5173/payment/cashfree/return';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: false });
  assert.deepEqual(gateways.map((gateway) => gateway.id), ['razorpay_checkout', 'cashfree_payments']);
});

test('resolveCheckoutGateway rejects disabled selections', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'single';
  process.env.PAYMENT_GATEWAY = 'razorpay_checkout';
  PaymentGatewaySetting.find = async () => [];

  await assert.rejects(
    () => paymentGatewayRegistry.resolveCheckoutGateway('pine_labs'),
    /Selected payment gateway is not enabled/
  );
});

test('hdfc is enabled in test mode when sandbox env vars exist', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'hdfc_smartgateway';
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_SMARTGATEWAY_MERCHANT_ID = 'merchant';
  process.env.HDFC_SMARTGATEWAY_API_KEY = 'api-key';
  process.env.HDFC_SMARTGATEWAY_SECRET_KEY = 'secret-key';
  process.env.HDFC_SMARTGATEWAY_SESSION_API_URL = 'https://sandbox.example.com/session';
  process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId';
  process.env.HDFC_SMARTGATEWAY_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const hdfc = gateways.find((gateway) => gateway.id === 'hdfc_smartgateway');

  assert.equal(hdfc.enabled, true);
  assert.equal(hdfc.status, 'ready');
  assert.equal(hdfc.ready, true);
  assert.deepEqual(hdfc.configReasons, []);
});

test('hdfc is unavailable when required sandbox env vars are missing', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'hdfc_smartgateway';
  process.env.HDFC_ENV = 'test';
  delete process.env.HDFC_SMARTGATEWAY_MERCHANT_ID;
  delete process.env.HDFC_MERCHANT_ID;
  delete process.env.HDFC_SMARTGATEWAY_API_KEY;
  delete process.env.HDFC_API_KEY;
  delete process.env.HDFC_SMARTGATEWAY_SECRET_KEY;
  delete process.env.HDFC_SECRET_KEY;
  delete process.env.HDFC_SMARTGATEWAY_SESSION_API_URL;
  delete process.env.HDFC_SESSION_API_URL;
  delete process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL;
  delete process.env.HDFC_ORDER_STATUS_API_URL;
  delete process.env.HDFC_SMARTGATEWAY_RETURN_URL;
  delete process.env.HDFC_RETURN_URL;
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const hdfc = gateways.find((gateway) => gateway.id === 'hdfc_smartgateway');

  assert.equal(hdfc.enabled, true);
  assert.equal(hdfc.status, 'unavailable');
  assert.equal(hdfc.ready, false);
  assert.match(hdfc.configReasons[0], /Missing env:/);
});

test('hdfc is unavailable with a clear message in live mode', async () => {
  process.env.PAYMENT_MODE = 'live';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'hdfc_smartgateway';
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_SMARTGATEWAY_MERCHANT_ID = 'merchant';
  process.env.HDFC_SMARTGATEWAY_API_KEY = 'api-key';
  process.env.HDFC_SMARTGATEWAY_SECRET_KEY = 'secret-key';
  process.env.HDFC_SMARTGATEWAY_SESSION_API_URL = 'https://sandbox.example.com/session';
  process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId';
  process.env.HDFC_SMARTGATEWAY_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const hdfc = gateways.find((gateway) => gateway.id === 'hdfc_smartgateway');

  assert.equal(hdfc.status, 'unavailable');
  assert.equal(hdfc.ready, false);
  assert.equal(
    hdfc.configReasons[0],
    'HDFC SmartGateway is configured for sandbox only. Set PAYMENT_MODE=test or HDFC_ENV=test to enable test checkout.'
  );
});

test('phonepe remains unavailable when required env vars are missing', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'phonepe_pg';
  delete process.env.PHONEPE_MERCHANT_ID;
  delete process.env.PHONEPE_SALT_KEY;
  delete process.env.PHONEPE_SALT_INDEX;
  process.env.PHONEPE_ENV = 'UAT';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const phonepe = gateways.find((gateway) => gateway.id === 'phonepe_pg');

  assert.equal(phonepe.status, 'unavailable');
  assert.equal(phonepe.ready, false);
  assert.match(phonepe.configReasons[0], /PHONEPE_MERCHANT_ID/);
});

test('cashfree availability stays ready when valid sandbox env vars are present', async () => {
  process.env.PAYMENT_MODE = 'test';
  process.env.PAYMENT_GATEWAY_MODE = 'multiple';
  process.env.ENABLED_PAYMENT_GATEWAYS = 'cashfree_payments';
  process.env.CASHFREE_CLIENT_ID = 'client-id';
  process.env.CASHFREE_CLIENT_SECRET = 'client-secret';
  process.env.CASHFREE_ENV = 'sandbox';
  process.env.CASHFREE_API_VERSION = '2023-08-01';
  process.env.CASHFREE_RETURN_URL = 'http://localhost:5173/payment/cashfree/return';
  PaymentGatewaySetting.find = async () => [];

  const gateways = await paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  const cashfree = gateways.find((gateway) => gateway.id === 'cashfree_payments');

  assert.equal(cashfree.status, 'ready');
  assert.equal(cashfree.ready, true);
});
