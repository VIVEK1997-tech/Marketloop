import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, required: true, trim: true },
    field: { type: String, required: true, trim: true },
    oldValue: { type: String, trim: true, default: '' },
    newValue: { type: String, trim: true, default: '' },
    updatedBy: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
