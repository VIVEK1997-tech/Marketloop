import { PaymentGatewayAdapter } from './base.adapter.js';
import { generateReference } from '../helpers.js';

export class SimulationAdapter extends PaymentGatewayAdapter {
  async createOrder({ order, amount, currency, mode }) {
    return {
      gatewayOrderId: generateReference(this.definition.id),
      providerOrderReference: generateReference(`${this.definition.id}_ORDER`),
      amount,
      currency,
      metadata: {
        mode,
        simulated: true,
        provider: this.definition.id
      }
    };
  }

  async initiatePayment({ order, gatewayOrder }) {
    return {
      checkout: {
        provider: 'instant-test',
        gatewayId: this.definition.id,
        title: this.definition.company,
        orderId: String(order._id),
        gatewayOrderId: gatewayOrder.gatewayOrderId,
        instructions: `Test-mode checkout for ${this.definition.company}.`,
        simulateStatus: 'success'
      }
    };
  }

  async verifyPayment({ payload = {} }) {
    const successful = String(payload.simulateStatus || payload.status || 'success').toLowerCase() !== 'failed';
    return {
      successful,
      status: successful ? 'captured' : 'failed',
      gatewayPaymentId: payload.gatewayPaymentId || generateReference(`${this.definition.id}_PAY`),
      rawPayload: payload
    };
  }

  async handleWebhook({ parsedPayload = {} }) {
    const eventId = parsedPayload.eventId || generateReference(`${this.definition.id}_WEBHOOK`);
    const successful = String(parsedPayload.status || 'success').toLowerCase() !== 'failed';
    return {
      eventId,
      successful,
      status: successful ? 'captured' : 'failed',
      gatewayOrderId: parsedPayload.gatewayOrderId || parsedPayload.orderId || '',
      gatewayPaymentId: parsedPayload.gatewayPaymentId || generateReference(`${this.definition.id}_PAY`),
      rawPayload: parsedPayload
    };
  }

  async refundPayment({ amount, currency, reason }) {
    return {
      refundId: generateReference(`${this.definition.id}_REFUND`),
      status: 'processed',
      amount,
      currency,
      rawPayload: { simulated: true, reason }
    };
  }

  async getPaymentStatus({ payment, order }) {
    return {
      status: payment?.status || order?.paymentStatus || 'pending',
      gatewayPaymentId: payment?.gatewayPaymentId || order?.gatewayPaymentId || ''
    };
  }
}
