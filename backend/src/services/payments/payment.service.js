import crypto from 'crypto';
import Invoice from '../../models/Invoice.js';
import Order from '../../models/Order.js';
import Payment from '../../models/Payment.js';
import PaymentRefund from '../../models/PaymentRefund.js';
import PaymentWebhookEvent from '../../models/PaymentWebhookEvent.js';
import Product from '../../models/Product.js';
import { ensureCustomerInvoiceForOrder } from '../invoice.service.js';
import { paymentGatewayRegistry } from './gateway-registry.service.js';
import { createPaymentError } from './errors.js';
import { generateIdempotencyKey, generateReceipt, mapPaymentStatus, sanitizePayload } from './helpers.js';

const buildPaymentRecordPayload = ({ order, gateway, result, idempotencyKey, existingPayment }) => ({
  order: order._id,
  buyer: order.buyer,
  product: order.product,
  seller: order.seller,
  paymentGateway: gateway.id,
  gatewayVariant: gateway.type,
  gatewayCompany: gateway.company,
  gatewayId: gateway.id,
  gatewayType: gateway.type,
  gatewayOrderId: result.gatewayOrderId || order.gatewayOrderId || existingPayment?.gatewayOrderId || '',
  gatewayPaymentId: result.gatewayPaymentId || order.gatewayPaymentId || existingPayment?.gatewayPaymentId || '',
  providerOrderReference: result.providerOrderReference || existingPayment?.providerOrderReference || '',
  providerPaymentReference: result.providerPaymentReference || existingPayment?.providerPaymentReference || '',
  payoutGatewayId: order.payoutGatewayId,
  status: result.status || existingPayment?.status || 'created',
  lifecycleStatus: result.lifecycleStatus || existingPayment?.lifecycleStatus || order.lifecycleStatus || 'created',
  method: result.method || existingPayment?.method || gateway.type,
  amount: order.amount,
  currency: order.currency,
  signature: result.signature || existingPayment?.signature || '',
  idempotencyKey,
  verificationPayload: result.verificationPayload || existingPayment?.verificationPayload,
  rawPayload: sanitizePayload(result.rawPayload || existingPayment?.rawPayload || {})
});

const syncLegacyGatewayFields = (order, gateway, result) => {
  if (gateway.id === 'razorpay_checkout') {
    order.razorpayOrderId = result.gatewayOrderId || order.razorpayOrderId;
    order.razorpayPaymentId = result.gatewayPaymentId || order.razorpayPaymentId;
  }

  if (gateway.id === 'payu_india') {
    order.payuTxnId = result.gatewayOrderId || order.payuTxnId;
    order.payuMihpayId = result.gatewayPaymentId || order.payuMihpayId;
  }
};

export const paymentService = {
  async createCheckoutOrder({ productId, quantity = 1, buyerUser, selectedGatewayId, selectedGatewayVariant, requestContext }) {
    const gateway = await paymentGatewayRegistry.resolveCheckoutGateway(selectedGatewayId);
    const payoutGateway = await paymentGatewayRegistry.resolvePayoutGateway();
    const product = await Product.findById(productId).populate('seller', 'name email phone');

    if (!product) throw createPaymentError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
    if (product.status === 'sold') throw createPaymentError('This product is already sold.', 400, 'PRODUCT_ALREADY_SOLD');
    if (String(product.seller._id) === String(buyerUser._id)) {
      throw createPaymentError('You cannot buy your own listing.', 400, 'SELF_PURCHASE_BLOCKED');
    }

    const unitPrice = Number(product.price);
    const normalizedQuantity = Math.max(1, Number(quantity || 1));
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw createPaymentError('Invalid product price.', 400, 'INVALID_PRODUCT_PRICE');
    }
    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      throw createPaymentError('Invalid product quantity.', 400, 'INVALID_PRODUCT_QUANTITY');
    }

    const subtotal = unitPrice * normalizedQuantity;
    const deliveryFee = subtotal > 699 ? 0 : 35;
    const amount = subtotal + deliveryFee;

    const order = await Order.create({
      buyer: buyerUser._id,
      product: product._id,
      seller: product.seller._id,
      quantity: normalizedQuantity,
      unitPrice,
      subtotal,
      deliveryFee,
      amount,
      currency: 'INR',
      receipt: generateReceipt(product._id, buyerUser._id),
      paymentGateway: gateway.id,
      gatewayVariant: gateway.type,
      gatewayCompany: gateway.company,
      gatewayId: gateway.id,
      gatewayType: gateway.type,
      payoutGatewayId: payoutGateway?.id || paymentGatewayRegistry.getDefaultPayoutGatewayId(),
      payoutGatewayCompany: payoutGateway?.company || '',
      payoutStatus: 'hold',
      gatewayMetadata: {
        ...(selectedGatewayVariant ? { providerVariant: selectedGatewayVariant } : {})
      }
    });

    const adapter = paymentGatewayRegistry.getAdapter(gateway.id);
    const createdOrder = await adapter.createOrder({
      definition: gateway,
      mode: paymentGatewayRegistry.getPaymentMode(),
      order,
      product,
      buyer: buyerUser,
      seller: product.seller,
      amount,
      currency: order.currency
    });

    order.gatewayOrderId = createdOrder.gatewayOrderId || order.gatewayOrderId;
    order.gatewayMetadata = {
      ...order.gatewayMetadata,
      ...(createdOrder.metadata || {})
    };
    syncLegacyGatewayFields(order, gateway, createdOrder);
    await order.save();

    const payment = await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        buyer: order.buyer,
        product: order.product,
        seller: order.seller,
        paymentGateway: gateway.id,
        gatewayVariant: gateway.type,
        gatewayCompany: gateway.company,
        gatewayId: gateway.id,
        gatewayType: gateway.type,
        gatewayOrderId: createdOrder.gatewayOrderId || '',
        providerOrderReference: createdOrder.providerOrderReference || '',
        payoutGatewayId: order.payoutGatewayId,
        status: 'created',
        amount,
        currency: order.currency,
        rawPayload: sanitizePayload(createdOrder.metadata || {})
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const initiatedPayment = await adapter.initiatePayment({
      mode: paymentGatewayRegistry.getPaymentMode(),
      order,
      payment,
      gatewayOrder: createdOrder,
      product,
      buyer: buyerUser,
      seller: product.seller,
      amount,
      currency: order.currency,
      requestContext
    });

    if (initiatedPayment?.status) {
      payment.status = initiatedPayment.status;
      payment.lifecycleStatus = initiatedPayment.status;
      payment.rawPayload = sanitizePayload({
        ...(payment.rawPayload || {}),
        ...(initiatedPayment.metadata || {}),
        checkout: initiatedPayment.checkout || {}
      });
      await payment.save();

      order.lifecycleStatus = initiatedPayment.status;
      order.gatewayMetadata = {
        ...order.gatewayMetadata,
        ...(initiatedPayment.metadata || {}),
        checkout: initiatedPayment.checkout || {},
        lifecycleStatus: initiatedPayment.status
      };
      await order.save();
    }

    return {
      order,
      payment,
      gateway,
      checkout: initiatedPayment.checkout
    };
  },

  async verifyOrderPayment({ gatewayId, orderId, payload, buyerUser }) {
    const gateway = paymentGatewayRegistry.getGatewayDefinition(gatewayId);
    if (!gateway) throw createPaymentError('Unknown gateway for verification.', 400, 'UNKNOWN_GATEWAY');

    const order = await Order.findById(orderId).populate('product seller');
    if (!order) throw createPaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');
    if (String(order.buyer) !== String(buyerUser._id)) {
      throw createPaymentError('You cannot verify this order.', 403, 'PAYMENT_ACCESS_DENIED');
    }

    const payment = await Payment.findOne({ order: order._id });
    const adapter = paymentGatewayRegistry.getAdapter(gateway.id);
    const result = await adapter.verifyPayment({
      mode: paymentGatewayRegistry.getPaymentMode(),
      order,
      payment,
      payload
    });

    return this.applyPaymentResult({
      order,
      payment,
      gateway,
      result,
      idempotencyKey: generateIdempotencyKey(gateway.id, order._id, result.gatewayPaymentId || 'verify'),
      buyerUser
    });
  },

  async applyPaymentResult({ order, payment, gateway, result, idempotencyKey, buyerUser }) {
    const normalizedStatus = mapPaymentStatus(result.status);
    const successful = result.successful && ['success', 'authorized'].includes(normalizedStatus);

    order.gatewayPaymentId = result.gatewayPaymentId || order.gatewayPaymentId;
    order.paymentStatus = normalizedStatus;
    order.lifecycleStatus = successful ? 'success' : (normalizedStatus === 'failed' ? 'failed' : 'pending');
    order.failureReason = successful ? undefined : result.failureReason || order.failureReason || 'Payment failed';
    order.paymentVerifiedAt = new Date();
    order.paidAt = successful ? new Date() : order.paidAt;
    order.payoutStatus = successful ? 'eligible' : 'hold';
    order.payoutEligibleAt = successful ? new Date() : order.payoutEligibleAt;
    syncLegacyGatewayFields(order, gateway, result);
    await order.save();

    const nextPayment = await Payment.findOneAndUpdate(
      { order: order._id },
      buildPaymentRecordPayload({
        order,
        gateway,
        result: {
          ...result,
          lifecycleStatus: successful ? 'success' : (normalizedStatus === 'failed' ? 'failed' : 'pending')
        },
        idempotencyKey,
        existingPayment: payment
      }),
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (successful) {
      await Product.findByIdAndUpdate(order.product._id || order.product, { status: 'sold' });
      await ensureCustomerInvoiceForOrder({ order, buyerUser });
    }

    return {
      order,
      payment: nextPayment,
      receipt: successful
        ? {
            receiptId: order.receipt,
            product: order.product.title,
            seller: order.seller.name,
            amount: order.amount,
            paidAt: order.paidAt,
            method: result.method || nextPayment.method || gateway.type
          }
        : null
    };
  },

  async recordFailedPayment({ orderId, buyerUser, errorPayload = {} }) {
    const order = await Order.findById(orderId);
    if (!order) throw createPaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');
    if (String(order.buyer) !== String(buyerUser._id)) {
      throw createPaymentError('You cannot update this order.', 403, 'PAYMENT_ACCESS_DENIED');
    }

    order.paymentStatus = 'failed';
    order.lifecycleStatus = 'failed';
    order.failureReason = errorPayload?.description || errorPayload?.reason || 'Payment failed';
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        status: 'failed',
        lifecycleStatus: 'failed',
        rawPayload: sanitizePayload(errorPayload)
      },
      { new: true }
    );

    return order;
  },

  async getMyOrders({ buyerUserId }) {
    const orders = await Order.find({ buyer: buyerUserId })
      .populate('product', 'title images price status')
      .populate('seller', 'name profileImage')
      .sort('-createdAt');

    const invoices = await Invoice.find({ 'meta.linkedOrderId': { $in: orders.map((order) => order._id) } }).select('invoiceNumber meta');
    const invoiceMap = new Map(invoices.map((invoice) => [String(invoice.meta?.linkedOrderId), { invoiceNumber: invoice.invoiceNumber, detailPath: `/invoices/${invoice.invoiceNumber}` }]));

    return orders.map((order) => ({
      ...order.toObject(),
      invoice: invoiceMap.get(String(order._id)) || null
    }));
  },

  async getOrderPaymentDetail({ orderId, userId }) {
    const order = await Order.findOne({
      _id: orderId,
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('product', 'title images price unit quantity normalizedPricePerKg status')
      .populate('seller', 'name profileImage')
      .populate('buyer', 'name profileImage');

    if (!order) throw createPaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');

    const [payment, invoice] = await Promise.all([
      Payment.findOne({ order: order._id }),
      Invoice.findOne({ 'meta.linkedOrderId': order._id }).select('invoiceNumber status issueDate dueDate total')
    ]);

    return {
      order: {
        ...order.toObject(),
        invoice: invoice
          ? {
              invoiceNumber: invoice.invoiceNumber,
              status: invoice.status,
              total: invoice.total,
              issueDate: invoice.issueDate,
              dueDate: invoice.dueDate,
              detailPath: `/invoices/${invoice.invoiceNumber}`
            }
          : null,
        tracking: {
          deliveryStatus: order.paymentStatus === 'success' ? 'processing' : 'awaiting_payment',
          estimatedDelivery: order.paymentStatus === 'success' ? new Date(Date.now() + 3 * 86400000).toISOString() : null
        }
      },
      payment
    };
  },

  async getPaymentStatus({ orderId, userId }) {
    const order = await Order.findOne({
      _id: orderId,
      $or: [{ buyer: userId }, { seller: userId }]
    });
    if (!order) throw createPaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');
    const payment = await Payment.findOne({ order: order._id });
    const gateway = paymentGatewayRegistry.getGatewayDefinition(order.gatewayId || order.paymentGateway);
    const adapter = paymentGatewayRegistry.getAdapter(gateway.id);
    const status = await adapter.getPaymentStatus({
      mode: paymentGatewayRegistry.getPaymentMode(),
      order,
      payment
    });
    return { order, payment, status };
  },

  async refundOrderPayment({ orderId, amount, reason, requestedBy }) {
    const order = await Order.findById(orderId).populate('product seller');
    if (!order) throw createPaymentError('Order not found.', 404, 'ORDER_NOT_FOUND');
    const payment = await Payment.findOne({ order: order._id });
    if (!payment) throw createPaymentError('Payment not found for this order.', 404, 'PAYMENT_NOT_FOUND');

    const refundAmount = Number(amount || payment.amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw createPaymentError('Refund amount must be greater than zero.', 400, 'INVALID_REFUND_AMOUNT');
    }
    if (refundAmount > (payment.amount - (payment.refundedAmount || 0))) {
      throw createPaymentError('Refund amount exceeds the remaining captured amount.', 400, 'REFUND_EXCEEDS_CAPTURED_AMOUNT');
    }

    const gateway = paymentGatewayRegistry.getGatewayDefinition(payment.gatewayId || payment.paymentGateway);
    const adapter = paymentGatewayRegistry.getAdapter(gateway.id);
    const result = await adapter.refundPayment({
      mode: paymentGatewayRegistry.getPaymentMode(),
      order,
      payment,
      amount: refundAmount,
      reason
    });

    const refund = await PaymentRefund.create({
      order: order._id,
      payment: payment._id,
      buyer: order.buyer,
      seller: order.seller._id || order.seller,
      gatewayId: gateway.id,
      gatewayCompany: gateway.company,
      gatewayRefundId: result.refundId,
      amount: refundAmount,
      currency: payment.currency,
      reason: reason || '',
      status: result.status,
      idempotencyKey: generateIdempotencyKey(gateway.id, order._id, result.refundId),
      rawPayload: sanitizePayload(result.rawPayload || {})
    });

    payment.refundedAmount = Number(payment.refundedAmount || 0) + refundAmount;
    payment.status = payment.refundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    await payment.save();

    order.paymentStatus = payment.status === 'refunded' ? 'refunded' : 'partially_refunded';
    order.payoutStatus = 'hold';
    await order.save();

    return { order, payment, refund };
  },

  async listAdminGateways() {
    return paymentGatewayRegistry.listGateways({ purpose: 'checkout', admin: true });
  },

  async updateAdminGateway({ gatewayId, payload, adminUserId }) {
    return paymentGatewayRegistry.updateGatewaySetting(gatewayId, payload, adminUserId);
  },

  async handleWebhook({ gatewayId, rawBody, parsedPayload, headers }) {
    const gateway = paymentGatewayRegistry.getGatewayDefinition(gatewayId);
    if (!gateway) throw createPaymentError(`Unknown webhook gateway: ${gatewayId}`, 404, 'UNKNOWN_GATEWAY');

    const payloadHash = crypto.createHash('sha256').update(Buffer.isBuffer(rawBody) ? rawBody : JSON.stringify(parsedPayload || {})).digest('hex');
    const eventId = parsedPayload?.eventId || headers['x-event-id'] || headers['x-webhook-id'] || '';
    const idempotencyKey = `${gateway.id}:${eventId || payloadHash}`;

    const existingEvent = await PaymentWebhookEvent.findOne({ idempotencyKey });
    if (existingEvent?.status === 'processed') {
      return { duplicate: true, event: existingEvent };
    }

    const adapter = paymentGatewayRegistry.getAdapter(gateway.id);
    const provisionalEvent = existingEvent || await PaymentWebhookEvent.create({
      gatewayId: gateway.id,
      eventId,
      idempotencyKey,
      payloadHash,
      status: 'received',
      rawPayload: sanitizePayload(parsedPayload || {})
    });

    const matchingOrder = await Order.findOne({
      $or: [
        ...(parsedPayload?.orderId ? [{ gatewayOrderId: parsedPayload.orderId }] : []),
        ...(parsedPayload?.gatewayOrderId ? [{ gatewayOrderId: parsedPayload.gatewayOrderId }] : []),
        ...(parsedPayload?.txnid ? [{ payuTxnId: parsedPayload.txnid }] : []),
        ...(parsedPayload?.razorpay_order_id ? [{ razorpayOrderId: parsedPayload.razorpay_order_id }] : [])
      ]
    }).populate('product seller buyer');

    const result = await adapter.handleWebhook({
      mode: paymentGatewayRegistry.getPaymentMode(),
      rawBody,
      parsedPayload,
      headers,
      order: matchingOrder || null
    });

    let order = matchingOrder;
    if (!order && result.gatewayOrderId) {
      order = await Order.findOne({ gatewayOrderId: result.gatewayOrderId }).populate('product seller buyer');
    }

    if (!order) {
      provisionalEvent.status = 'ignored';
      provisionalEvent.processedAt = new Date();
      await provisionalEvent.save();
      return { duplicate: false, ignored: true, event: provisionalEvent };
    }

    const payment = await Payment.findOne({ order: order._id });
    const applied = await this.applyPaymentResult({
      order,
      payment,
      gateway,
      result,
      idempotencyKey,
      buyerUser: order.buyer
    });

    provisionalEvent.order = order._id;
    provisionalEvent.payment = applied.payment._id;
    provisionalEvent.status = 'processed';
    provisionalEvent.processedAt = new Date();
    provisionalEvent.rawPayload = sanitizePayload(result.rawPayload || parsedPayload || {});
    await provisionalEvent.save();

    return { duplicate: false, ignored: false, event: provisionalEvent, order: applied.order, payment: applied.payment };
  }
};
