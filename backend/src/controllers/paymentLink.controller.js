import PaymentLink from '../models/PaymentLink.js';
import { sendSuccess } from '../utils/apiResponse.js';

const PAYMENT_STATUSES = new Set(['PENDING', 'SUCCESS', 'FAILED']);

const resolveClientBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto || req.protocol || 'http';
  const origin = req.get('origin');
  if (origin) return origin.replace(/\/+$/, '');
  const clientUrl = String(process.env.CLIENT_URL || '').trim().replace(/\/+$/, '');
  if (clientUrl) return clientUrl;
  return `${protocol}://${req.get('host') || 'localhost:5173'}`.replace(/\/+$/, '');
};

const buildPaymentLink = (req, paymentId) => `${resolveClientBaseUrl(req)}/payment/${paymentId}`;

const serializePayment = (payment) => ({
  payment_id: payment.paymentId,
  user_id: payment.userId,
  amount: payment.amount,
  currency: payment.currency,
  status: payment.status,
  created_at: payment.createdAt,
  updated_at: payment.updatedAt,
  payment_link: payment.paymentUrl,
  last_status_source: payment.lastStatusSource,
  paid_at: payment.paidAt || null,
  failed_at: payment.failedAt || null,
  notes: payment.notes || ''
});

export const createPayment = async (req, res) => {
  const { user_id: userId, amount, currency = 'INR', notes = '' } = req.body;
  const payment = await PaymentLink.create({
    userId: String(userId).trim(),
    amount: Number(amount),
    currency: String(currency || 'INR').trim().toUpperCase(),
    status: 'PENDING',
    notes: String(notes || '').trim(),
    lastStatusSource: 'system'
  });

  payment.paymentUrl = buildPaymentLink(req, payment.paymentId);
  await payment.save();

  return sendSuccess(res, {
    payment: serializePayment(payment),
    payment_link: payment.paymentUrl
  }, {
    statusCode: 201,
    message: 'Payment link created successfully'
  });
};

export const updatePaymentStatus = async (req, res) => {
  const { payment_id: paymentId, status, notes = '' } = req.body;
  const normalizedStatus = String(status || '').trim().toUpperCase();
  const payment = await PaymentLink.findOne({ paymentId: String(paymentId || '').trim() });
  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }
  if (!PAYMENT_STATUSES.has(normalizedStatus)) {
    const error = new Error('Invalid payment status.');
    error.statusCode = 400;
    throw error;
  }

  payment.status = normalizedStatus;
  payment.lastStatusSource = 'api';
  payment.notes = String(notes || payment.notes || '').trim();
  if (normalizedStatus === 'SUCCESS') {
    payment.paidAt = payment.paidAt || new Date();
    payment.failedAt = undefined;
  }
  if (normalizedStatus === 'FAILED') {
    payment.failedAt = new Date();
  }
  if (normalizedStatus === 'PENDING') {
    payment.paidAt = undefined;
    payment.failedAt = undefined;
  }
  await payment.save();

  return sendSuccess(res, {
    payment: serializePayment(payment)
  }, {
    message: 'Payment status updated successfully'
  });
};

export const getPaymentPage = async (req, res) => {
  const payment = await PaymentLink.findOne({ paymentId: String(req.params.paymentId || '').trim() });
  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, {
    payment: serializePayment(payment)
  });
};

export const listAdminPayments = async (req, res) => {
  const { status = '', user_id: userId = '' } = req.query;
  const query = {};
  const normalizedStatus = String(status || '').trim().toUpperCase();
  if (normalizedStatus) {
    query.status = normalizedStatus;
  }
  if (String(userId || '').trim()) {
    query.userId = String(userId).trim();
  }

  const payments = await PaymentLink.find(query).sort({ createdAt: -1 }).lean();

  return sendSuccess(res, {
    filters: {
      status: normalizedStatus || 'ALL',
      user_id: String(userId || '').trim()
    },
    payments: payments.map(serializePayment)
  });
};

export const simulatePaymentWebhook = async (req, res) => {
  const payment = await PaymentLink.findOne({ paymentId: String(req.params.paymentId || '').trim() });
  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }

  const normalizedStatus = String(req.body.status || 'SUCCESS').trim().toUpperCase();
  if (!PAYMENT_STATUSES.has(normalizedStatus)) {
    const error = new Error('Invalid payment status.');
    error.statusCode = 400;
    throw error;
  }

  payment.status = normalizedStatus;
  payment.lastStatusSource = 'webhook';
  payment.notes = `Simulated webhook updated status to ${normalizedStatus}`;
  if (normalizedStatus === 'SUCCESS') {
    payment.paidAt = payment.paidAt || new Date();
    payment.failedAt = undefined;
  }
  if (normalizedStatus === 'FAILED') {
    payment.failedAt = new Date();
  }
  if (normalizedStatus === 'PENDING') {
    payment.paidAt = undefined;
    payment.failedAt = undefined;
  }
  await payment.save();

  return sendSuccess(res, {
    payment: serializePayment(payment)
  }, {
    message: 'Webhook simulation applied successfully'
  });
};
