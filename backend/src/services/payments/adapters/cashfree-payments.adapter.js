import {
  createOrder as createCashfreeOrder,
  getCashfreeConfig,
  getPaymentStatus as getCashfreePaymentStatus,
  handleWebhook as handleCashfreeWebhook,
  refundPayment as createCashfreeRefund,
  verifyPayment as verifyCashfreeOrder
} from '../../cashfreeService.js';
import { createPaymentError } from '../errors.js';
import { generateReference, resolveClientAppUrl, sanitizePayload } from '../helpers.js';
import { PaymentGatewayAdapter } from './base.adapter.js';

const mapCashfreeStatus = (status) => {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'PAID' || normalized === 'SUCCESS') return 'captured';
  if (normalized === 'ACTIVE' || normalized === 'PENDING' || normalized === 'NOT_ATTEMPTED') return 'pending';
  if (normalized === 'FAILED' || normalized === 'CANCELLED' || normalized === 'USER_DROPPED') return 'failed';
  return normalized.toLowerCase() || 'pending';
};

const buildReturnUrl = ({ baseReturnUrl, localOrderId, productId, quantity }) => {
  const url = new URL(baseReturnUrl);
  url.searchParams.set('localOrderId', String(localOrderId));
  url.searchParams.set('productId', String(productId));
  url.searchParams.set('qty', String(quantity || 1));
  url.searchParams.set('gateway', 'cashfree_payments');
  return url.toString();
};

export class CashfreePaymentsAdapter extends PaymentGatewayAdapter {
  getLiveAvailability() {
    const { clientId, clientSecret } = getCashfreeConfig();
    return Boolean(clientId && clientSecret);
  }

  async createOrder({ order, amount, currency }) {
    if (!this.getLiveAvailability()) {
      throw createPaymentError(
        'Cashfree sandbox credentials are missing. Configure CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET.',
        503,
        'CASHFREE_NOT_CONFIGURED'
      );
    }

    return {
      gatewayOrderId: generateReference('MLCF'),
      providerOrderReference: '',
      amount,
      currency,
      metadata: {
        simulated: false,
        provider: 'cashfree_payments'
      }
    };
  }

  async initiatePayment({ order, gatewayOrder, product, buyer, requestContext }) {
    const config = getCashfreeConfig();
    const returnUrl = buildReturnUrl({
      baseReturnUrl: config.returnUrl || `${resolveClientAppUrl(requestContext)}/payment/cashfree/return`,
      localOrderId: order._id,
      productId: product._id,
      quantity: order.quantity || 1
    });

    const response = await createCashfreeOrder({
      order_id: gatewayOrder.gatewayOrderId,
      order_amount: Number(order.amount),
      order_currency: order.currency || 'INR',
      customer_details: {
        customer_id: String(buyer._id || buyer.id),
        customer_name: buyer.name || 'MarketLoop Buyer',
        customer_email: buyer.email || undefined,
        customer_phone: buyer.phone || '9999999999'
      },
      order_meta: {
        return_url: returnUrl
      },
      order_note: `MarketLoop order ${order.receipt}`
    });

    return {
      checkout: {
        provider: 'cashfree',
        paymentSessionId: response.payment_session_id,
        orderId: gatewayOrder.gatewayOrderId,
        cashfreeOrderId: response.cf_order_id,
        returnUrl,
        mode: config.env === 'production' ? 'production' : 'sandbox'
      }
    };
  }

  async verifyPayment({ order, payload = {} }) {
    const cashfreeOrderId = String(
      payload.cashfreeOrderId
      || payload.order_id
      || payload.orderId
      || payload.gatewayOrderId
      || order.gatewayOrderId
      || ''
    ).trim();
    if (!cashfreeOrderId) {
      throw createPaymentError('Cashfree order ID is required for verification.', 400, 'CASHFREE_ORDER_ID_REQUIRED');
    }

    const [orderResponse, paymentsResponse] = await Promise.all([
      verifyCashfreeOrder(cashfreeOrderId),
      getCashfreePaymentStatus(cashfreeOrderId).catch(() => [])
    ]);

    const paymentList = Array.isArray(paymentsResponse) ? paymentsResponse : paymentsResponse?.data || [];
    const successfulPayment = paymentList.find((payment) => {
      const status = String(payment.payment_status || payment.status || '').toUpperCase();
      return status === 'SUCCESS' || status === 'PAID';
    });
    const normalizedStatus = mapCashfreeStatus(orderResponse?.order_status || successfulPayment?.payment_status);

    return {
      successful: normalizedStatus === 'captured',
      status: normalizedStatus,
      gatewayOrderId: cashfreeOrderId,
      gatewayPaymentId: successfulPayment?.cf_payment_id || successfulPayment?.payment_id || '',
      providerOrderReference: orderResponse?.cf_order_id || '',
      providerPaymentReference: successfulPayment?.cf_payment_id || successfulPayment?.payment_id || '',
      method: successfulPayment?.payment_group || successfulPayment?.payment_method || 'cashfree',
      failureReason: normalizedStatus === 'captured'
        ? ''
        : (orderResponse?.order_status || successfulPayment?.payment_status || 'Cashfree payment is pending or failed.'),
      rawPayload: sanitizePayload({
        order: orderResponse,
        payments: paymentList
      }),
      verificationPayload: sanitizePayload(payload)
    };
  }

  async handleWebhook({ parsedPayload, headers, rawBody }) {
    const { order, payments, orderId } = await handleCashfreeWebhook(parsedPayload || {}, headers || {}, rawBody || '');
    const paymentList = Array.isArray(payments) ? payments : payments?.data || [];
    const successfulPayment = paymentList.find((payment) => {
      const status = String(payment.payment_status || payment.status || '').toUpperCase();
      return status === 'SUCCESS' || status === 'PAID';
    });
    const normalizedStatus = mapCashfreeStatus(order?.order_status || successfulPayment?.payment_status);

    return {
      successful: normalizedStatus === 'captured',
      status: normalizedStatus,
      gatewayOrderId: orderId || '',
      gatewayPaymentId: successfulPayment?.cf_payment_id || successfulPayment?.payment_id || '',
      providerOrderReference: order?.cf_order_id || '',
      providerPaymentReference: successfulPayment?.cf_payment_id || successfulPayment?.payment_id || '',
      method: successfulPayment?.payment_group || successfulPayment?.payment_method || 'cashfree',
      failureReason: normalizedStatus === 'captured' ? '' : (order?.order_status || 'Cashfree webhook indicates pending or failed payment.'),
      rawPayload: sanitizePayload({
        order,
        payments: paymentList,
        event: parsedPayload
      })
    };
  }

  async refundPayment({ payment, amount, reason }) {
    const paymentId = payment?.gatewayPaymentId || payment?.providerPaymentReference;
    if (!paymentId) {
      throw createPaymentError('Cashfree payment ID is missing for refund.', 400, 'CASHFREE_PAYMENT_ID_REQUIRED');
    }

    const refundReference = generateReference('CFRF');
    const response = await createCashfreeRefund(paymentId, amount, refundReference);

    return {
      refundId: response?.cf_refund_id || refundReference,
      status: String(response?.refund_status || 'pending').toLowerCase(),
      amount,
      currency: payment?.currency || 'INR',
      rawPayload: sanitizePayload(response),
      reason
    };
  }

  async getPaymentStatus({ order, payment }) {
    const cashfreeOrderId = payment?.gatewayOrderId || order?.gatewayOrderId;
    if (!cashfreeOrderId) {
      return {
        status: payment?.status || order?.paymentStatus || 'pending',
        gatewayPaymentId: payment?.gatewayPaymentId || ''
      };
    }

    const [orderResponse, paymentsResponse] = await Promise.all([
      verifyCashfreeOrder(cashfreeOrderId),
      getCashfreePaymentStatus(cashfreeOrderId).catch(() => [])
    ]);

    const paymentList = Array.isArray(paymentsResponse) ? paymentsResponse : paymentsResponse?.data || [];
    const successfulPayment = paymentList.find((item) => {
      const status = String(item.payment_status || item.status || '').toUpperCase();
      return status === 'SUCCESS' || status === 'PAID';
    });

    return {
      status: mapCashfreeStatus(orderResponse?.order_status || successfulPayment?.payment_status),
      gatewayPaymentId: successfulPayment?.cf_payment_id || payment?.gatewayPaymentId || '',
      method: successfulPayment?.payment_group || payment?.method || 'cashfree',
      rawPayload: sanitizePayload({
        order: orderResponse,
        payments: paymentList
      })
    };
  }
}
