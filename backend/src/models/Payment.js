import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, required: true, index: true },
    signature: { type: String },
    status: { type: String, enum: ['created', 'authorized', 'captured', 'failed', 'refunded'], default: 'created', index: true },
    method: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    rawPayload: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayPaymentId: 1, razorpayOrderId: 1 }, { unique: true });

export default mongoose.model('Payment', paymentSchema);
