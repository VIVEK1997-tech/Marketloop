import { PaymentGatewayAdapter } from './base.adapter.js';
import { createPaymentError } from '../errors.js';

export class PlaceholderAdapter extends PaymentGatewayAdapter {
  buildUnsupportedError() {
    return createPaymentError(
      `${this.definition.company} (${this.definition.id}) is registered in MarketLoop but not implemented for runtime checkout yet.`,
      501,
      'GATEWAY_PLACEHOLDER'
    );
  }

  async createOrder() {
    throw this.buildUnsupportedError();
  }

  async initiatePayment() {
    throw this.buildUnsupportedError();
  }

  async verifyPayment() {
    throw this.buildUnsupportedError();
  }

  async handleWebhook() {
    throw this.buildUnsupportedError();
  }

  async refundPayment() {
    throw this.buildUnsupportedError();
  }

  async getPaymentStatus() {
    throw this.buildUnsupportedError();
  }
}
