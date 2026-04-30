import mongoose from 'mongoose';

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    gatewayId: { type: String, required: true, index: true },
    eventId: { type: String, default: '', index: true },
    idempotencyKey: { type: String, required: true, unique: true },
    payloadHash: { type: String, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
    status: { type: String, enum: ['received', 'processed', 'ignored', 'failed'], default: 'received', index: true },
    processedAt: Date,
    rawPayload: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model('PaymentWebhookEvent', paymentWebhookEventSchema);
