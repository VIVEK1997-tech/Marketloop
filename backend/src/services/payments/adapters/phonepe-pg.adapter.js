import { createPayment, handleWebhook as handlePhonePeWebhook, verifyPayment as verifyPhonePePayment, getPhonePeConfig } from '../../phonepeService.js';
import { createPaymentError } from '../errors.js';
import { generateReference, resolveClientAppUrl, sanitizePayload } from '../helpers.js';
import { PaymentGatewayAdapter } from './base.adapter.js';

const buildMarketLoopUrl = (baseUrl, path, params = {}) => {
  const url = new URL(path, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const mapPhonePeStatus = (state) => {
  const normalized = String(state || '').trim().toUpperCase();
  if (normalized === 'COMPLETED') return 'captured';
  if (normalized === 'PENDING') return 'pending';
  if (normalized === 'PAYMENT_PENDING') return 'pending';
  if (normalized === 'FAILED') return 'failed';
  if (normalized === 'CANCELLED') return 'cancelled';
  return normalized.toLowerCase() || 'pending';
};

export class PhonePePgAdapter extends PaymentGatewayAdapter {
  getLiveAvailability() {
    const { merchantId, saltKey, saltIndex } = getPhonePeConfig();
    return Boolean(merchantId && saltKey && saltIndex);
  }

  async createOrder(context) {
    const { amount, currency } = context;
    if (!this.getLiveAvailability()) {
      throw createPaymentError(
        'PhonePe sandbox/live credentials are missing. Configure PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, and PHONEPE_SALT_INDEX.',
        503,
        'PHONEPE_NOT_CONFIGURED'
      );
    }

    const amountPaise = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      throw createPaymentError('Invalid PhonePe order amount.', 400, 'PHONEPE_INVALID_AMOUNT');
    }

    const merchantTransactionId = generateReference('MLPP');

    return {
      gatewayOrderId: merchantTransactionId,
      providerOrderReference: merchantTransactionId,
      amount,
      amountSubunits: amountPaise,
      currency,
      metadata: {
        simulated: false,
        provider: 'phonepe_pg',
        merchantTransactionId
      }
    };
  }

  async initiatePayment({ order, gatewayOrder, product, buyer, seller, amount, requestContext }) {
    const clientUrl = resolveClientAppUrl(requestContext);
    const transactionId = gatewayOrder.gatewayOrderId || gatewayOrder.providerOrderReference;

    const redirectUrl = buildMarketLoopUrl(clientUrl, '/checkout', {
      productId: product._id,
      qty: order.quantity || 1,
      gateway: 'phonepe_pg',
      orderId: order._id,
      transactionId,
      returnStatus: 'phonepe'
    });

    const response = await createPayment({
      merchantTransactionId: transactionId,
      amountPaise: gatewayOrder.amountSubunits || Math.round(Number(amount) * 100),
      redirectUrl,
      callbackUrl: redirectUrl,
      merchantUserId: buyer._id || buyer.id,
      mobileNumber: buyer.phone,
      orderId: order._id,
      productId: product._id,
      buyerId: buyer._id || buyer.id,
      sellerId: seller._id || seller.id
    });

    const instrumentResponse = response?.data?.instrumentResponse || {};
    const paymentUrl = instrumentResponse?.redirectInfo?.url || instrumentResponse?.redirectInfo?.redirectUrl;
    if (!paymentUrl) {
      throw createPaymentError(
        response?.message || 'PhonePe did not return a redirect URL for checkout.',
        502,
        'PHONEPE_REDIRECT_URL_MISSING',
        response
      );
    }

    return {
      checkout: {
        provider: 'redirect-url',
        url: paymentUrl,
        providerName: 'PhonePe',
        transactionId,
        returnUrl: redirectUrl
      }
    };
  }

  async verifyPayment({ order, payload = {} }) {
    const transactionId = String(
      payload.transactionId
      || payload.merchantTransactionId
      || payload.gatewayOrderId
      || order.gatewayOrderId
      || ''
    ).trim();

    if (!transactionId) {
      throw createPaymentError('PhonePe transaction ID is required for verification.', 400, 'PHONEPE_TRANSACTION_REQUIRED');
    }

    const response = await verifyPhonePePayment(transactionId);
    const state = response?.data?.state || response?.data?.status || response?.code;
    const normalizedStatus = mapPhonePeStatus(state);
    const providerReference = response?.data?.transactionId || response?.data?.providerReferenceId || transactionId;

    return {
      successful: normalizedStatus === 'captured',
      status: normalizedStatus,
      gatewayOrderId: transactionId,
      gatewayPaymentId: providerReference,
      providerPaymentReference: providerReference,
      providerOrderReference: transactionId,
      method: response?.data?.paymentInstrument?.type || 'phonepe_pg',
      failureReason: normalizedStatus === 'captured'
        ? ''
        : (response?.message || response?.data?.responseCodeDescription || response?.code || 'PhonePe payment was not completed.'),
      rawPayload: sanitizePayload(response),
      verificationPayload: sanitizePayload(payload)
    };
  }

  async handleWebhook({ parsedPayload }) {
    const { verification, transactionId } = await handlePhonePeWebhook(parsedPayload || {});
    const state = verification?.data?.state || verification?.data?.status || verification?.code;
    const normalizedStatus = mapPhonePeStatus(state);
    const providerReference = verification?.data?.transactionId || verification?.data?.providerReferenceId || transactionId;

    return {
      successful: normalizedStatus === 'captured',
      status: normalizedStatus,
      gatewayOrderId: transactionId,
      gatewayPaymentId: providerReference,
      providerPaymentReference: providerReference,
      method: verification?.data?.paymentInstrument?.type || 'phonepe_pg',
      failureReason: normalizedStatus === 'captured' ? '' : (verification?.message || 'PhonePe webhook payment is pending or failed.'),
      rawPayload: sanitizePayload(verification)
    };
  }

  async refundPayment() {
    throw createPaymentError('PhonePe refund flow is not implemented yet in MarketLoop.', 501, 'PHONEPE_REFUND_NOT_IMPLEMENTED');
  }

  async getPaymentStatus({ order, payment }) {
    const transactionId = payment?.gatewayOrderId || order?.gatewayOrderId;
    if (!transactionId) {
      return {
        status: payment?.status || order?.paymentStatus || 'pending',
        gatewayPaymentId: payment?.gatewayPaymentId || ''
      };
    }

    const response = await verifyPhonePePayment(transactionId);
    const state = response?.data?.state || response?.data?.status || response?.code;
    return {
      status: mapPhonePeStatus(state),
      gatewayPaymentId: response?.data?.transactionId || response?.data?.providerReferenceId || payment?.gatewayPaymentId || '',
      method: response?.data?.paymentInstrument?.type || payment?.method || 'phonepe_pg',
      rawPayload: sanitizePayload(response)
    };
  }
}
