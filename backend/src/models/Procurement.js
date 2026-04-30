import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema(
  {
    procurementId: { type: String, required: true, unique: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    requestTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['draft', 'requested', 'approved', 'ordered', 'partially received', 'fully received', 'closed'],
      default: 'draft',
      index: true
    },
    quantityPlan: { type: String, trim: true, default: '' },
    expectedVsActual: { type: String, trim: true, default: '' },
    qualityScore: { type: Number, min: 0, max: 5, default: 0 },
    deliveryScore: { type: Number, min: 0, max: 5, default: 0 },
    priceCompetitiveness: { type: Number, min: 0, max: 5, default: 0 },
    rejectionRate: { type: Number, min: 0, default: 0 },
    location: { type: String, trim: true, default: '' },
    season: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Procurement', procurementSchema);
