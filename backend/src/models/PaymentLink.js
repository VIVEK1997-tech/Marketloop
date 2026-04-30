import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const paymentLinkSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      default: () => randomUUID(),
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    paymentUrl: {
      type: String,
      default: ''
    },
    lastStatusSource: {
      type: String,
      enum: ['system', 'api', 'webhook'],
      default: 'system'
    },
    notes: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    paidAt: Date,
    failedAt: Date
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

export default mongoose.model('PaymentLink', paymentLinkSchema);
