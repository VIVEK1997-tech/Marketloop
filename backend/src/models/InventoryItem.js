import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    inventoryId: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, required: true, trim: true, index: true },
    batchNumber: { type: String, trim: true, default: '' },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    incomingQuantity: { type: Number, default: 0, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    rejectedQuantity: { type: Number, default: 0, min: 0 },
    unitType: { type: String, required: true, trim: true, default: 'Kg' },
    warehouseLocation: { type: String, trim: true, default: '' },
    purchaseSource: { type: String, trim: true, default: '' },
    expiryDate: { type: Date },
    freshnessStatus: { type: String, enum: ['green', 'orange', 'red'], default: 'green', index: true },
    reorderLevel: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('InventoryItem', inventoryItemSchema);
