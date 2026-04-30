import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentGateway: { type: String, default: 'razorpay_checkout', index: true },
    gatewayVariant: { type: String, default: 'checkout', index: true },
    gatewayCompany: { type: String, default: '', index: true },
    gatewayId: { type: String, default: 'razorpay_checkout', index: true },
    gatewayType: { type: String, default: 'checkout', index: true },
    gatewayOrderId: { type: String, default: '', index: true },
    gatewayPaymentId: { type: String, default: '', index: true },
    providerOrderReference: { type: String, default: '' },
    providerPaymentReference: { type: String, default: '' },
    payoutGatewayId: { type: String, default: process.env.DEFAULT_PAYOUT_GATEWAY || 'cashfree_payouts', index: true },
    status: {
      type: String,
      enum: ['created', 'payment_link_generated', 'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'],
      default: 'created',
      index: true
    },
    lifecycleStatus: {
      type: String,
      enum: ['created', 'payment_link_generated', 'pending', 'success', 'failed'],
      default: 'created',
      index: true
    },
    method: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    signature: { type: String, default: '' },
    idempotencyKey: { type: String, default: '', index: true },
    refundedAmount: { type: Number, default: 0, min: 0 },
    verificationPayload: mongoose.Schema.Types.Mixed,
    rawPayload: mongoose.Schema.Types.Mixed,
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    payuTxnId: { type: String },
    payuMihpayId: { type: String }
  },
  { timestamps: true }
);

paymentSchema.pre('validate', function syncGatewayFields(next) {
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

paymentSchema.index(
  { gatewayId: 1, gatewayOrderId: 1, gatewayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      gatewayOrderId: { $exists: true, $type: 'string', $gt: '' },
      gatewayPaymentId: { $exists: true, $type: 'string', $gt: '' }
    }
  }
);

export default mongoose.model('Payment', paymentSchema);
