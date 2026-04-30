import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    movementId: { type: String, required: true, unique: true, trim: true },
    movementType: { type: String, enum: ['Inward', 'Outward', 'Returns', 'Adjustment', 'Wastage'], required: true },
    itemName: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: '' },
    reference: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('InventoryMovement', inventoryMovementSchema);
