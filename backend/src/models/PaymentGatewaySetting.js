import mongoose from 'mongoose';

const paymentGatewaySettingSchema = new mongoose.Schema(
  {
    gatewayId: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: true },
    checkoutEnabled: { type: Boolean, default: true },
    payoutEnabled: { type: Boolean, default: true },
    notes: { type: String, trim: true, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('PaymentGatewaySetting', paymentGatewaySettingSchema);
