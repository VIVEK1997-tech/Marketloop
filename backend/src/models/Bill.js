import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true, unique: true, trim: true },
    linkedReference: { type: String, trim: true, default: '' },
    partyName: { type: String, required: true, trim: true },
    billAmount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    paymentMode: { type: String, enum: ['UPI', 'Bank transfer', 'Card', 'Wallet', 'Cash'], default: 'Bank transfer' },
    paymentReference: { type: String, trim: true, default: '' },
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid', 'failed'], default: 'pending', index: true },
    paymentDate: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
