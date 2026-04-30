import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true, default: '' },
    level: { type: String, enum: ['info', 'warning', 'danger', 'success'], default: 'info', index: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('AdminNotification', adminNotificationSchema);
