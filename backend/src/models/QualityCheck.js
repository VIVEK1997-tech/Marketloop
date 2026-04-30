import mongoose from 'mongoose';

const qualityCheckSchema = new mongoose.Schema(
  {
    inspectionId: { type: String, required: true, unique: true, trim: true },
    productName: { type: String, required: true, trim: true },
    supplierName: { type: String, trim: true, default: '' },
    batchNumber: { type: String, trim: true, default: '' },
    procurementReference: { type: String, trim: true, default: '' },
    purchaseReference: { type: String, trim: true, default: '' },
    inspectionDate: { type: Date, required: true },
    inspectorName: { type: String, required: true, trim: true },
    qualityStatus: { type: String, enum: ['green', 'orange', 'red'], required: true, index: true },
    freshnessRating: { type: Number, min: 1, max: 5, default: 3 },
    ripenessLevel: { type: String, trim: true, default: '' },
    damageLevel: { type: String, trim: true, default: '' },
    sizeWeightCompliance: { type: String, trim: true, default: '' },
    appearanceCondition: { type: String, trim: true, default: '' },
    smellCondition: { type: String, trim: true, default: '' },
    shelfLifeEstimate: { type: String, trim: true, default: '' },
    remarks: { type: String, trim: true, default: '' },
    photoProof: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('QualityCheck', qualityCheckSchema);
