import mongoose from 'mongoose';
import { UOM, UOM_VALUES, getConversionMeta, getDefaultUnitForCategory, getNormalizedPricePerKg } from '../utils/uom.js';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UOM_VALUES, default: UOM.KG, index: true },
    quantity: { type: Number, min: 0 },
    normalizedPricePerKg: { type: Number, min: 0, index: true },
    crateWeightKg: { type: Number, min: 0 },
    truckWeightKg: { type: Number, min: 8000, max: 20000 },
    conversionMeta: {
      unitWeightKg: { type: Number, min: 0 },
      note: { type: String, trim: true }
    },
    category: { type: String, required: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['available', 'sold'], default: 'available', index: true },
    views: { type: Number, default: 0 },
    interestCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

productSchema.index({ coordinates: '2dsphere' });

productSchema.pre('validate', function normalizeUom(next) {
  try {
    this.unit = this.unit || getDefaultUnitForCategory(this.category);
    this.normalizedPricePerKg = getNormalizedPricePerKg({
      price: this.price,
      unit: this.unit,
      title: this.title,
      category: this.category,
      crateWeightKg: this.crateWeightKg,
      truckWeightKg: this.truckWeightKg
    });
    this.conversionMeta = getConversionMeta({
      unit: this.unit,
      title: this.title,
      category: this.category,
      crateWeightKg: this.crateWeightKg,
      truckWeightKg: this.truckWeightKg
    });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('Product', productSchema);
