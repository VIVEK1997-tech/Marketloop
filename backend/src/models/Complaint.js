import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true, trim: true },
    complaintType: { type: String, required: true, trim: true },
    against: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'resolved', 'investigating'], default: 'open', index: true },
    note: { type: String, trim: true, default: '' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    raisedByName: { type: String, trim: true, default: '' },
    raisedByRole: { type: String, trim: true, default: 'buyer' },
    linkedOrderId: { type: String, trim: true, default: '' },
    linkedPaymentId: { type: String, trim: true, default: '' },
    resolutionNotes: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
