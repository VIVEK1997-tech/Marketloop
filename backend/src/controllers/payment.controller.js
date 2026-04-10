import crypto from 'crypto';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Product from '../models/Product.js';
import { getRazorpayConfig, getRazorpayInstance } from '../utils/razorpay.js';

const createReceipt = (productId, userId) => `ml_${String(productId).slice(-6)}_${String(userId).slice(-6)}_${Date.now()}`;

const safeSignatureCompare = (expected, received) => {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const verifyPaymentSignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) {
    const error = new Error('Razorpay secret is not configured');
    error.statusCode = 503;
    throw error;
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return safeSignatureCompare(expectedSignature, razorpaySignature);
};

export const createPaymentOrder = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId).populate('seller', 'name email phone');

  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.status === 'sold') return res.status(400).json({ message: 'This product is already sold' });
  if (product.seller._id.equals(req.user._id)) return res.status(400).json({ message: 'You cannot buy your own listing' });

  const amountPaise = Math.round(Number(product.price) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return res.status(400).json({ message: 'Invalid product price' });
  }

  const razorpay = getRazorpayInstance();
  const receipt = createReceipt(product._id, req.user._id);
  const razorpayOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: {
      productId: product._id.toString(),
      buyerId: req.user._id.toString(),
      sellerId: product.seller._id.toString(),
      platform: 'MarketLoop'
    }
  });

  const order = await Order.create({
    buyer: req.user._id,
    product: product._id,
    seller: product.seller._id,
    amount: product.price,
    currency: 'INR',
    receipt,
    paymentStatus: 'pending',
    razorpayOrderId: razorpayOrder.id
  });

  res.status(201).json({
    order: {
      id: order._id,
      receipt: order.receipt,
      amount: amountPaise,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id
    },
    checkout: {
      key: process.env.RAZORPAY_KEY_ID,
      amount: amountPaise,
      currency: 'INR',
      name: 'MarketLoop',
      description: product.title,
      order_id: razorpayOrder.id,
      prefill: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone
      },
      notes: {
        productId: product._id,
        sellerId: product.seller._id
      }
    }
  });
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;

  const order = await Order.findOne({ razorpayOrderId }).populate('product seller');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!order.buyer.equals(req.user._id)) return res.status(403).json({ message: 'You cannot verify this order' });

  const valid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!valid) {
    order.paymentStatus = 'failed';
    order.failureReason = 'Invalid Razorpay signature';
    await order.save();
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  let paymentMethod = 'unknown';
  let rawPayment = null;
  try {
    const razorpay = getRazorpayInstance();
    rawPayment = await razorpay.payments.fetch(razorpayPaymentId);
    paymentMethod = rawPayment.method || 'unknown';
  } catch {
    paymentMethod = 'verified';
  }

  order.paymentStatus = 'success';
  order.razorpayPaymentId = razorpayPaymentId;
  order.paidAt = new Date();
  await order.save();

  await Payment.findOneAndUpdate(
    { razorpayOrderId, razorpayPaymentId },
    {
      order: order._id,
      buyer: order.buyer,
      product: order.product._id,
      seller: order.seller._id,
      razorpayOrderId,
      razorpayPaymentId,
      signature: razorpaySignature,
      status: rawPayment?.status || 'captured',
      method: paymentMethod,
      amount: order.amount,
      currency: order.currency,
      rawPayload: rawPayment
    },
    { upsert: true, new: true }
  );

  await Product.findByIdAndUpdate(order.product._id, { status: 'sold' });

  res.json({
    message: 'Payment verified successfully',
    order,
    receipt: {
      receiptId: order.receipt,
      product: order.product.title,
      seller: order.seller.name,
      amount: order.amount,
      paidAt: order.paidAt,
      method: paymentMethod
    }
  });
};

export const markPaymentFailed = async (req, res) => {
  const { razorpayOrderId, error } = req.body;
  const order = await Order.findOneAndUpdate(
    { razorpayOrderId, buyer: req.user._id },
    { paymentStatus: 'failed', failureReason: error?.description || error?.reason || 'Payment failed' },
    { new: true }
  );

  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Payment failure recorded', order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('product', 'title images price status')
    .populate('seller', 'name profileImage')
    .sort('-createdAt');

  res.json({ orders });
};

export const getPaymentByOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, buyer: req.user._id })
    .populate('product', 'title images price')
    .populate('seller', 'name profileImage');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const payment = await Payment.findOne({ order: order._id });
  res.json({ order, payment });
};

export const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(503).json({ message: 'Webhook secret is not configured' });

  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', webhookSecret).update(req.body).digest('hex');

  if (!safeSignatureCompare(expected, signature)) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body.toString('utf8'));
  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity?.order_id) return res.json({ received: true });

  const order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });
  if (!order) return res.json({ received: true });

  if (event.event === 'payment.captured') {
    order.paymentStatus = 'success';
    order.razorpayPaymentId = paymentEntity.id;
    order.paidAt = order.paidAt || new Date();
    await order.save();
    await Product.findByIdAndUpdate(order.product, { status: 'sold' });
  }

  if (event.event === 'payment.failed') {
    order.paymentStatus = 'failed';
    order.failureReason = paymentEntity.error_description || paymentEntity.error_reason || 'Payment failed';
    await order.save();
  }

  await Payment.findOneAndUpdate(
    { razorpayOrderId: paymentEntity.order_id, razorpayPaymentId: paymentEntity.id },
    {
      order: order._id,
      buyer: order.buyer,
      product: order.product,
      seller: order.seller,
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
      status: paymentEntity.status,
      method: paymentEntity.method,
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      rawPayload: paymentEntity
    },
    { upsert: true }
  );

  res.json({ received: true });
};
