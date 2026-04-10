import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true, maxlength: 1000 },
    reviewType: { type: String, enum: ['product', 'seller'], required: true, index: true },
    helpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    notHelpfulBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, trim: true, maxlength: 300 },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    verifiedBuyer: { type: Boolean, default: true }
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer: 1, product: 1, reviewType: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
