import test from 'node:test';
import assert from 'node:assert/strict';
import { getGatewayDefinition } from '../../src/config/paymentGateways.js';
import { SimulationAdapter } from '../../src/services/payments/adapters/simulation.adapter.js';
import { RazorpayCheckoutAdapter } from '../../src/services/payments/adapters/razorpay-checkout.adapter.js';

test('simulation adapter verifies test payment successfully', async () => {
  const adapter = new SimulationAdapter(getGatewayDefinition('cashfree_payments'));
  const result = await adapter.verifyPayment({ payload: { simulateStatus: 'success' } });

  assert.equal(result.successful, true);
  assert.equal(result.status, 'captured');
  assert.ok(result.gatewayPaymentId);
});

test('simulation adapter handles webhook idempotently at payload level', async () => {
  const adapter = new SimulationAdapter(getGatewayDefinition('paypal_india'));
  const first = await adapter.handleWebhook({ parsedPayload: { eventId: 'evt_1', status: 'success', gatewayOrderId: 'ORD_1' } });
  const second = await adapter.handleWebhook({ parsedPayload: { eventId: 'evt_1', status: 'success', gatewayOrderId: 'ORD_1' } });

  assert.equal(first.eventId, 'evt_1');
  assert.equal(second.eventId, 'evt_1');
  assert.equal(first.gatewayOrderId, 'ORD_1');
  assert.equal(second.gatewayOrderId, 'ORD_1');
});

test('razorpay adapter falls back to test verification when credentials are absent in test mode', async () => {
  const adapter = new RazorpayCheckoutAdapter(getGatewayDefinition('razorpay_checkout'));
  const result = await adapter.verifyPayment({ mode: 'test', payload: { simulateStatus: 'success' } });

  assert.equal(result.successful, true);
  assert.equal(result.status, 'captured');
});
