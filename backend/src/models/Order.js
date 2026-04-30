import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    receipt: { type: String, required: true, index: true },
    paymentGateway: { type: String, default: 'razorpay_checkout', index: true },
    gatewayVariant: { type: String, default: 'checkout', index: true },
    gatewayCompany: { type: String, default: '', index: true },
    gatewayId: { type: String, default: 'razorpay_checkout', index: true },
    gatewayType: { type: String, default: 'checkout', index: true },
    gatewayOrderId: { type: String, default: '', index: true },
    gatewayPaymentId: { type: String, default: '', index: true },
    gatewayMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    paymentStatus: {
      type: String,
      enum: ['pending', 'authorized', 'success', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true
    },
    lifecycleStatus: {
      type: String,
      enum: ['created', 'payment_link_generated', 'pending', 'success', 'failed'],
      default: 'created',
      index: true
    },
    payoutGatewayId: { type: String, default: process.env.DEFAULT_PAYOUT_GATEWAY || 'cashfree_payouts', index: true },
    payoutGatewayCompany: { type: String, default: '' },
    payoutStatus: { type: String, enum: ['hold', 'eligible', 'processing', 'released', 'failed'], default: 'hold', index: true },
    payoutEligibleAt: Date,
    payoutReleasedAt: Date,
    paymentVerifiedAt: Date,
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String, index: true },
    payuTxnId: { type: String, index: true },
    payuMihpayId: { type: String, index: true },
    failureReason: String,
    paidAt: Date
  },
  { timestamps: true }
);

orderSchema.pre('validate', function syncGatewayFields(next) {
  if (!this.gatewayId && this.paymentGateway) this.gatewayId = this.paymentGateway;
  if (!this.paymentGateway && this.gatewayId) this.paymentGateway = this.gatewayId;
  if (!this.gatewayType && this.gatewayVariant) this.gatewayType = this.gatewayVariant;
  if (!this.gatewayVariant && this.gatewayType) this.gatewayVariant = this.gatewayType;
  if (!this.gatewayOrderId && this.razorpayOrderId) this.gatewayOrderId = this.razorpayOrderId;
  if (!this.gatewayOrderId && this.payuTxnId) this.gatewayOrderId = this.payuTxnId;
  if (!this.gatewayPaymentId && this.razorpayPaymentId) this.gatewayPaymentId = this.razorpayPaymentId;
  if (!this.gatewayPaymentId && this.payuMihpayId) this.gatewayPaymentId = this.payuMihpayId;

  if (this.gatewayId === 'razorpay_checkout') {
    this.paymentGateway = 'razorpay';
    this.gatewayVariant = 'primary';
    this.gatewayType = this.gatewayType || 'checkout';
  }

  if (this.gatewayId === 'payu_india') {
    this.paymentGateway = 'payu';
    this.gatewayVariant = typeof this.gatewayVariant === 'string' && ['primary', 'secondary'].includes(this.gatewayVariant)
      ? this.gatewayVariant
      : 'primary';
    this.gatewayType = this.gatewayType || 'checkout';
  }

  next();
});

orderSchema.index(
  { gatewayId: 1, gatewayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      gatewayOrderId: { $exists: true, $type: 'string', $gt: '' }
    }
  }
);

orderSchema.index(
  { gatewayId: 1, gatewayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      gatewayPaymentId: { $exists: true, $type: 'string', $gt: '' }
    }
  }
);

export default mongoose.model('Order', orderSchema);
