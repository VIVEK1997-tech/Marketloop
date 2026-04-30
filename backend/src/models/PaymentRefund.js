import mongoose from 'mongoose';

const paymentRefundSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gatewayId: { type: String, required: true, index: true },
    gatewayCompany: { type: String, default: '' },
    gatewayRefundId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    reason: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending', index: true },
    idempotencyKey: { type: String, required: true, unique: true },
    rawPayload: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model('PaymentRefund', paymentRefundSchema);
