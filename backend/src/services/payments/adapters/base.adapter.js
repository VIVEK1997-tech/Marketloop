import { createPaymentError } from '../errors.js';

export class PaymentGatewayAdapter {
  constructor(definition, options = {}) {
    this.definition = definition;
    this.options = options;
  }

  assertImplemented(methodName) {
    throw createPaymentError(`${this.definition.id} does not implement ${methodName} yet.`, 501, 'GATEWAY_NOT_IMPLEMENTED');
  }

  async createOrder() {
    this.assertImplemented('createOrder');
  }

  async initiatePayment() {
    this.assertImplemented('initiatePayment');
  }

  async verifyPayment() {
    this.assertImplemented('verifyPayment');
  }

  async handleWebhook() {
    this.assertImplemented('handleWebhook');
  }

  async refundPayment() {
    this.assertImplemented('refundPayment');
  }

  async getPaymentStatus() {
    this.assertImplemented('getPaymentStatus');
  }
}
