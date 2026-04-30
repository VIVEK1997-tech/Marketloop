import mongoose from 'mongoose';

const billingPartySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
    addressLine: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'India' },
    postalCode: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const invoiceLineItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, trim: true, default: '' },
    quantity: { type: Number, min: 0, default: 1 },
    unit: { type: String, trim: true, default: 'unit' },
    rate: { type: Number, min: 0, default: 0 },
    grossAmount: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    offerLabel: { type: String, trim: true, default: '' },
    hsnCode: { type: String, trim: true, default: '' },
    taxableAmount: { type: Number, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const taxSummarySchema = new mongoose.Schema(
  {
    grossAmount: { type: Number, min: 0, default: 0 },
    discountTotal: { type: Number, min: 0, default: 0 },
    taxableAmount: { type: Number, min: 0, default: 0 },
    cgstRate: { type: Number, min: 0, default: 0 },
    cgstAmount: { type: Number, min: 0, default: 0 },
    sgstRate: { type: Number, min: 0, default: 0 },
    sgstAmount: { type: Number, min: 0, default: 0 },
    igstRate: { type: Number, min: 0, default: 0 },
    igstAmount: { type: Number, min: 0, default: 0 },
    totalTax: { type: Number, min: 0, default: 0 },
    additionalCharges: { type: Number, min: 0, default: 0 },
    deliveryCharges: { type: Number, min: 0, default: 0 },
    grandTotal: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const invoiceMetaSchema = new mongoose.Schema(
  {
    linkedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    linkedPurchaseId: { type: String, trim: true, default: '' },
    currency: { type: String, trim: true, default: 'INR' },
    placeOfSupply: { type: String, trim: true, default: '' },
    pdfGeneratedAt: Date
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true, index: true },
    invoiceType: { type: String, enum: ['purchase', 'sales', 'supplier', 'customer'], required: true, index: true },
    linkedReference: { type: String, trim: true, default: '' },
    partyName: { type: String, required: true, trim: true },
    total: { type: Number, required: true, min: 0 },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'paid', 'partial', 'cancelled'], default: 'pending', index: true },
    buyer: billingPartySchema,
    seller: billingPartySchema,
    lineItems: [invoiceLineItemSchema],
    taxSummary: taxSummarySchema,
    meta: invoiceMetaSchema
  },
  { timestamps: true }
);

invoiceSchema.pre('validate', function syncInvoiceTotals(next) {
  if (!this.partyName) {
    this.partyName = this.buyer?.name || this.seller?.name || 'MarketLoop Party';
  }

  if (!this.linkedReference) {
    this.linkedReference = this.meta?.linkedPurchaseId || (this.meta?.linkedOrderId ? String(this.meta.linkedOrderId) : '');
  }

  if (this.taxSummary?.grandTotal) {
    this.total = this.taxSummary.grandTotal;
  } else if (Array.isArray(this.lineItems) && this.lineItems.length) {
    this.total = this.lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  next();
});

export default mongoose.model('Invoice', invoiceSchema);
