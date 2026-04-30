import test from 'node:test';
import assert from 'node:assert/strict';
import { getGatewayDefinition } from '../../src/config/paymentGateways.js';
import {
  createOrder as createHdfcSession,
  getPaymentStatus as getHdfcPaymentStatus
} from '../../src/services/hdfcPaymentService.js';
import { HdfcSmartgatewayAdapter } from '../../src/services/payments/adapters/hdfc-smartgateway.adapter.js';

const snapshotEnv = () => ({
  HDFC_ENV: process.env.HDFC_ENV,
  HDFC_MOCK_MODE: process.env.HDFC_MOCK_MODE,
  HDFC_RETURN_URL: process.env.HDFC_RETURN_URL,
  HDFC_MERCHANT_ID: process.env.HDFC_MERCHANT_ID,
  HDFC_API_KEY: process.env.HDFC_API_KEY,
  HDFC_SECRET_KEY: process.env.HDFC_SECRET_KEY,
  HDFC_SESSION_API_URL: process.env.HDFC_SESSION_API_URL,
  HDFC_ORDER_STATUS_API_URL: process.env.HDFC_ORDER_STATUS_API_URL
});

const restoreEnv = (snapshot) => {
  Object.entries(snapshot).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
};

test('hdfc create session succeeds in mock mode', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'true';
  process.env.HDFC_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';

  try {
    const result = await createHdfcSession({
      merchantOrderId: 'ml_receipt_1',
      gatewayOrderId: 'MLHDFC_ORDER_1',
      amount: 435,
      currency: 'INR',
      customer: {
        id: 'buyer_1',
        name: 'Buyer One',
        email: 'buyer@example.com',
        phone: '9999999999'
      },
      returnUrl: 'http://localhost:5173/payment/hdfc/return?localOrderId=123',
      clientBaseUrl: 'http://localhost:5173',
      metadata: { localOrderId: '123' }
    });

    assert.equal(result.status, 'payment_link_generated');
    assert.match(result.payment_link, /payment\/hdfc\/mock-gateway/);
    assert.equal(result.mock, true);
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc create session falls back to mock checkout when sandbox API returns a failure response', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';
  process.env.HDFC_MERCHANT_ID = 'merchant';
  process.env.HDFC_API_KEY = 'api-key';
  process.env.HDFC_SECRET_KEY = 'secret-key';
  process.env.HDFC_SESSION_API_URL = 'https://sandbox.example.com/session';

  try {
    const result = await createHdfcSession({
        merchantOrderId: 'ml_receipt_2',
        gatewayOrderId: 'MLHDFC_ORDER_2',
        amount: 500,
        currency: 'INR',
        customer: { id: 'buyer_2' },
        returnUrl: 'http://localhost:5173/payment/hdfc/return?localOrderId=456',
        clientBaseUrl: 'http://localhost:5173',
        metadata: { localOrderId: '456' },
        fetchImpl: async () => ({
          ok: false,
          status: 502,
          text: async () => JSON.stringify({ message: 'sandbox unavailable' })
        })
      });

    assert.equal(result.mock, true);
    assert.match(result.payment_link, /payment\/hdfc\/mock-gateway/);
    assert.equal(result.raw?.fallbackReason, 'sandbox unavailable');
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc order status reports success from status api', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_MERCHANT_ID = 'merchant';
  process.env.HDFC_API_KEY = 'api-key';
  process.env.HDFC_SECRET_KEY = 'secret-key';
  process.env.HDFC_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId/status';

  try {
    const result = await getHdfcPaymentStatus({
      merchantOrderId: 'ml_receipt_3',
      gatewayOrderId: 'MLHDFC_ORDER_3',
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({ status: 'success', payment_id: 'txn_success_1' })
      })
    });

    assert.equal(result.successful, true);
    assert.equal(result.status, 'success');
    assert.equal(result.payment_id, 'txn_success_1');
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc order status reports failed from status api', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_MERCHANT_ID = 'merchant';
  process.env.HDFC_API_KEY = 'api-key';
  process.env.HDFC_SECRET_KEY = 'secret-key';
  process.env.HDFC_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId/status';

  try {
    const result = await getHdfcPaymentStatus({
      merchantOrderId: 'ml_receipt_4',
      gatewayOrderId: 'MLHDFC_ORDER_4',
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({ order_status: 'failed', transaction_id: 'txn_failed_1' })
      })
    });

    assert.equal(result.successful, false);
    assert.equal(result.status, 'failed');
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc duplicate status call reuses existing captured payment safely', async () => {
  const adapter = new HdfcSmartgatewayAdapter(getGatewayDefinition('hdfc_smartgateway'));
  const result = await adapter.verifyPayment({
    order: {
      paymentStatus: 'success',
      gatewayOrderId: 'MLHDFC_ORDER_DUP',
      receipt: 'ml_receipt_dup'
    },
    payment: {
      gatewayOrderId: 'MLHDFC_ORDER_DUP',
      gatewayPaymentId: 'txn_duplicate_1',
      providerOrderReference: 'ml_receipt_dup',
      providerPaymentReference: 'txn_duplicate_1',
      method: 'hdfc_smartgateway'
    },
    payload: {}
  });

  assert.equal(result.successful, true);
  assert.equal(result.status, 'captured');
  assert.equal(result.gatewayPaymentId, 'txn_duplicate_1');
});

test('hdfc verify payment uses mock return data when checkout session was created in mock mode', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_SMARTGATEWAY_MERCHANT_ID = 'SG5003';
  process.env.HDFC_SMARTGATEWAY_API_KEY = 'real-looking-api-key';
  process.env.HDFC_SMARTGATEWAY_SECRET_KEY = 'real-looking-secret';
  process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId';

  try {
    const adapter = new HdfcSmartgatewayAdapter(getGatewayDefinition('hdfc_smartgateway'));
    const result = await adapter.verifyPayment({
      order: {
        receipt: 'ml_receipt_mock_return',
        gatewayOrderId: 'MLHDFC_ORDER_MOCK_RETURN',
        gatewayMetadata: {
          hdfcMockMode: true
        }
      },
      payment: {
        gatewayOrderId: 'MLHDFC_ORDER_MOCK_RETURN',
        rawPayload: {
          hdfcMockMode: true
        }
      },
      payload: {
        mockStatus: 'success',
        mockTxnId: 'txn_mock_return_1'
      }
    });

    assert.equal(result.successful, true);
    assert.equal(result.status, 'captured');
    assert.equal(result.gatewayPaymentId, 'txn_mock_return_1');
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc falls back to mock mode when config values are masked placeholders', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_SMARTGATEWAY_MERCHANT_ID = 'SG5003';
  process.env.HDFC_SMARTGATEWAY_API_KEY = '******1313';
  process.env.HDFC_SMARTGATEWAY_SECRET_KEY = '2C3F073D5A34D848855ECAC2067B30';
  process.env.HDFC_SMARTGATEWAY_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';

  try {
    const result = await createHdfcSession({
      merchantOrderId: 'ml_receipt_masked',
      gatewayOrderId: 'MLHDFC_MASKED',
      amount: 250,
      currency: 'INR',
      customer: {
        id: 'buyer_masked',
        name: 'Buyer Masked',
        email: 'buyer@example.com',
        phone: '9999999999'
      },
      returnUrl: 'http://localhost:5173/payment/hdfc/return?localOrderId=999',
      clientBaseUrl: 'http://localhost:5173',
      metadata: { localOrderId: '999' }
    });

    assert.equal(result.mock, true);
    assert.match(result.payment_link, /payment\/hdfc\/mock-gateway/);
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('hdfc falls back to mock checkout when sandbox fetch throws in test mode', async () => {
  const envSnapshot = snapshotEnv();
  process.env.HDFC_ENV = 'test';
  process.env.HDFC_MOCK_MODE = 'false';
  process.env.HDFC_SMARTGATEWAY_MERCHANT_ID = 'SG5003';
  process.env.HDFC_SMARTGATEWAY_API_KEY = 'real-looking-api-key';
  process.env.HDFC_SMARTGATEWAY_SECRET_KEY = 'real-looking-secret';
  process.env.HDFC_SMARTGATEWAY_SESSION_API_URL = 'https://sandbox.example.com/session';
  process.env.HDFC_SMARTGATEWAY_ORDER_STATUS_API_URL = 'https://sandbox.example.com/orders/:orderId';
  process.env.HDFC_SMARTGATEWAY_RETURN_URL = 'http://localhost:5173/payment/hdfc/return';

  try {
    const result = await createHdfcSession({
      merchantOrderId: 'ml_receipt_fetch_failed',
      gatewayOrderId: 'MLHDFC_FETCH_FAILED',
      amount: 250,
      currency: 'INR',
      customer: {
        id: 'buyer_fetch',
        name: 'Buyer Fetch',
        email: 'buyer@example.com',
        phone: '9999999999'
      },
      returnUrl: 'http://localhost:5173/payment/hdfc/return?localOrderId=1000',
      clientBaseUrl: 'http://localhost:5173',
      metadata: { localOrderId: '1000' },
      fetchImpl: async () => {
        throw new TypeError('fetch failed');
      }
    });

    assert.equal(result.mock, true);
    assert.match(result.payment_link, /payment\/hdfc\/mock-gateway/);
    assert.equal(result.raw?.fallbackReason, 'fetch failed');
  } finally {
    restoreEnv(envSnapshot);
  }
});
