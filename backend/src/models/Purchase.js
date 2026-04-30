import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: { type: String, required: true, unique: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    contactDetails: { type: String, trim: true, default: '' },
    productName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantityPurchased: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, default: 'Kg' },
    purchasePrice: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date },
    receivedDate: { type: Date },
    purchaseStatus: { type: String, enum: ['pending', 'approved', 'ordered', 'received', 'cancelled'], default: 'pending', index: true },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid', 'failed'], default: 'pending', index: true },
    invoiceStatus: { type: String, enum: ['pending', 'generated', 'cancelled'], default: 'pending', index: true },
    billStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid', index: true },
    linkedInventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }
  },
  { timestamps: true }
);

export default mongoose.model('Purchase', purchaseSchema);
