import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';

const DEFAULT_GST_RATE = 5;
const DEFAULT_HSN_CODE = '0800';

const roundCurrency = (value) => Number((Number(value || 0)).toFixed(2));
const safeText = (value, fallback = '') => String(value || fallback).trim();

const safeDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const buildBillingParty = ({ user, fallbackName, gstNumber = '' }) => ({
  ...(user?._id ? { user: user._id } : {}),
  name: safeText(user?.name, fallbackName || 'MarketLoop User'),
  email: safeText(user?.email),
  phone: safeText(user?.phone),
  gstNumber: safeText(gstNumber),
  addressLine: safeText(user?.location?.address),
  city: safeText(user?.location?.city),
  state: safeText(user?.location?.state),
  country: safeText(user?.location?.country, 'India'),
  postalCode: ''
});

const derivePlaceOfSupply = ({ buyer, seller }) => safeText(buyer?.state || seller?.state || 'India');

const calculateTaxSummary = ({
  grossAmount,
  discountTotal,
  taxRate = DEFAULT_GST_RATE,
  additionalCharges = 0,
  deliveryCharges = 0,
  buyer,
  seller
}) => {
  const gross = roundCurrency(grossAmount);
  const discount = roundCurrency(discountTotal);
  const taxableAmount = roundCurrency(Math.max(gross - discount, 0));
  const totalTax = roundCurrency((taxableAmount * taxRate) / 100);
  const sameState = safeText(buyer?.state).toLowerCase() && safeText(buyer?.state).toLowerCase() === safeText(seller?.state).toLowerCase();

  const cgstRate = sameState ? roundCurrency(taxRate / 2) : 0;
  const sgstRate = sameState ? roundCurrency(taxRate / 2) : 0;
  const igstRate = sameState ? 0 : roundCurrency(taxRate);
  const cgstAmount = sameState ? roundCurrency(totalTax / 2) : 0;
  const sgstAmount = sameState ? roundCurrency(totalTax / 2) : 0;
  const igstAmount = sameState ? 0 : totalTax;
  const additional = roundCurrency(additionalCharges);
  const delivery = roundCurrency(deliveryCharges);
  const grandTotal = roundCurrency(taxableAmount + totalTax + additional + delivery);

  return {
    grossAmount: gross,
    discountTotal: discount,
    taxableAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTax,
    additionalCharges: additional,
    deliveryCharges: delivery,
    grandTotal
  };
};

const buildLineItem = ({
  itemName,
  quantity = 1,
  unit = 'unit',
  rate = 0,
  discount = 0,
  offerLabel = '',
  hsnCode = DEFAULT_HSN_CODE,
  taxRate = DEFAULT_GST_RATE
}) => {
  const qty = Number(quantity || 1);
  const lineRate = Number(rate || 0);
  const grossAmount = roundCurrency(qty * lineRate);
  const discountValue = roundCurrency(discount);
  const taxableAmount = roundCurrency(Math.max(grossAmount - discountValue, 0));
  const taxAmount = roundCurrency((taxableAmount * taxRate) / 100);

  return {
    itemName: safeText(itemName, 'MarketLoop Item'),
    quantity: qty,
    unit: safeText(unit, 'unit'),
    rate: lineRate,
    grossAmount,
    discount: discountValue,
    offerLabel: safeText(offerLabel),
    hsnCode: safeText(hsnCode, DEFAULT_HSN_CODE),
    taxableAmount,
    taxRate,
    taxAmount,
    total: roundCurrency(taxableAmount + taxAmount)
  };
};

export const buildNormalizedInvoiceDocument = async (invoiceDoc) => {
  if (!invoiceDoc) return null;
  const raw = typeof invoiceDoc.toObject === 'function' ? invoiceDoc.toObject() : invoiceDoc;

  const buyer = raw.buyer || {};
  const seller = raw.seller || {};
  const lineItems = Array.isArray(raw.lineItems) && raw.lineItems.length
    ? raw.lineItems.map((item) => ({
        itemName: safeText(item.itemName || item.name, 'MarketLoop Item'),
        quantity: Number(item.quantity || 1),
        unit: safeText(item.unit, 'unit'),
        rate: roundCurrency(item.rate),
        grossAmount: roundCurrency(item.grossAmount || item.rate * item.quantity),
        discount: roundCurrency(item.discount),
        offerLabel: safeText(item.offerLabel),
        hsnCode: safeText(item.hsnCode, DEFAULT_HSN_CODE),
        taxableAmount: roundCurrency(item.taxableAmount || Math.max((item.grossAmount || item.rate * item.quantity || 0) - (item.discount || 0), 0)),
        taxRate: roundCurrency(item.taxRate || item.tax || DEFAULT_GST_RATE),
        taxAmount: roundCurrency(item.taxAmount || item.tax || 0),
        total: roundCurrency(item.total || raw.total || 0)
      }))
    : [buildLineItem({
        itemName: safeText(raw.partyName || raw.invoiceNumber, 'MarketLoop Item'),
        quantity: 1,
        unit: 'unit',
        rate: raw.total || 0,
        discount: 0,
        offerLabel: '',
        hsnCode: DEFAULT_HSN_CODE,
        taxRate: DEFAULT_GST_RATE
      })];

  const grossAmount = roundCurrency(lineItems.reduce((sum, item) => sum + item.grossAmount, 0));
  const discountTotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.discount, 0));
  const additionalCharges = roundCurrency(raw.taxSummary?.additionalCharges);
  const deliveryCharges = roundCurrency(raw.taxSummary?.deliveryCharges);
  const taxSummary = raw.taxSummary?.grandTotal
    ? {
        grossAmount: roundCurrency(raw.taxSummary.grossAmount || grossAmount),
        discountTotal: roundCurrency(raw.taxSummary.discountTotal || discountTotal),
        taxableAmount: roundCurrency(raw.taxSummary.taxableAmount),
        cgstRate: roundCurrency(raw.taxSummary.cgstRate),
        cgstAmount: roundCurrency(raw.taxSummary.cgstAmount),
        sgstRate: roundCurrency(raw.taxSummary.sgstRate),
        sgstAmount: roundCurrency(raw.taxSummary.sgstAmount),
        igstRate: roundCurrency(raw.taxSummary.igstRate),
        igstAmount: roundCurrency(raw.taxSummary.igstAmount),
        totalTax: roundCurrency(raw.taxSummary.totalTax),
        additionalCharges,
        deliveryCharges,
        grandTotal: roundCurrency(raw.taxSummary.grandTotal)
      }
    : calculateTaxSummary({
        grossAmount,
        discountTotal,
        taxRate: lineItems[0]?.taxRate || DEFAULT_GST_RATE,
        additionalCharges,
        deliveryCharges,
        buyer,
        seller
      });

  return {
    ...raw,
    buyer: {
      name: safeText(buyer.name, 'Buyer'),
      email: safeText(buyer.email),
      phone: safeText(buyer.phone),
      gstNumber: safeText(buyer.gstNumber),
      addressLine: safeText(buyer.addressLine),
      city: safeText(buyer.city),
      state: safeText(buyer.state),
      country: safeText(buyer.country, 'India'),
      postalCode: safeText(buyer.postalCode),
      user: buyer.user
    },
    seller: {
      name: safeText(seller.name, raw.partyName || 'Seller'),
      email: safeText(seller.email),
      phone: safeText(seller.phone),
      gstNumber: safeText(seller.gstNumber),
      addressLine: safeText(seller.addressLine),
      city: safeText(seller.city),
      state: safeText(seller.state),
      country: safeText(seller.country, 'India'),
      postalCode: safeText(seller.postalCode),
      user: seller.user
    },
    lineItems,
    taxSummary,
    meta: {
      linkedOrderId: raw.meta?.linkedOrderId,
      linkedPurchaseId: safeText(raw.meta?.linkedPurchaseId),
      currency: safeText(raw.meta?.currency, 'INR'),
      placeOfSupply: safeText(raw.meta?.placeOfSupply, derivePlaceOfSupply({ buyer, seller })),
      pdfGeneratedAt: raw.meta?.pdfGeneratedAt || null
    },
    total: roundCurrency(taxSummary.grandTotal || raw.total)
  };
};

export const getInvoiceAccessFilter = (user) => {
  const roles = user?.roles || (user?.role ? [user.role] : []);
  if (roles.includes('admin')) return {};
  return {
    $or: [{ 'buyer.user': user._id }, { 'seller.user': user._id }]
  };
};

export const findAccessibleInvoice = async ({ user, invoiceIdOrNumber }) => {
  const accessFilter = getInvoiceAccessFilter(user);
  const identifierFilter = mongoose.Types.ObjectId.isValid(invoiceIdOrNumber)
    ? { $or: [{ _id: invoiceIdOrNumber }, { invoiceNumber: invoiceIdOrNumber }] }
    : { invoiceNumber: invoiceIdOrNumber };

  const invoice = await Invoice.findOne({
    ...accessFilter,
    ...identifierFilter
  });

  return buildNormalizedInvoiceDocument(invoice);
};

export const listAccessibleInvoices = async ({ user }) => {
  const accessFilter = getInvoiceAccessFilter(user);
  const invoices = await Invoice.find(accessFilter).sort('-issueDate');
  return Promise.all(invoices.map((invoice) => buildNormalizedInvoiceDocument(invoice)));
};

export const ensureCustomerInvoiceForOrder = async ({ order, buyerUser }) => {
  if (!order?._id) return null;

  const existing = await Invoice.findOne({ 'meta.linkedOrderId': order._id });
  if (existing) return existing;

  const hydratedOrder = await Order.findById(order._id).populate('product').populate('seller').lean();
  if (!hydratedOrder?.product) return null;

  const buyer = buyerUser || await User.findById(hydratedOrder.buyer).lean();
  const seller = hydratedOrder.seller;
  const product = hydratedOrder.product;

  const quantity = Number(product.quantity || 1);
  const rate = roundCurrency(hydratedOrder.amount || product.price || 0);
  const lineItem = buildLineItem({
    itemName: product.title,
    quantity: 1,
    unit: product.unit || 'unit',
    rate,
    discount: 0,
    offerLabel: 'MarketLoop checkout',
    hsnCode: DEFAULT_HSN_CODE,
    taxRate: DEFAULT_GST_RATE
  });
  const additionalCharges = 0;
  const deliveryCharges = 40;
  const taxSummary = calculateTaxSummary({
    grossAmount: lineItem.grossAmount,
    discountTotal: lineItem.discount,
    taxRate: lineItem.taxRate,
    additionalCharges,
    deliveryCharges,
    buyer,
    seller
  });

  const issueDate = safeDate(hydratedOrder.paidAt || hydratedOrder.createdAt);
  const dueDate = new Date(issueDate);
  dueDate.setDate(dueDate.getDate() + 3);

  return Invoice.create({
    invoiceNumber: `INV-S-${issueDate.toISOString().slice(2, 10).replace(/-/g, '')}-${String(hydratedOrder._id).slice(-4).toUpperCase()}`,
    invoiceType: 'customer',
    linkedReference: safeText(hydratedOrder.receipt || hydratedOrder._id),
    partyName: safeText(buyer?.name, seller?.name),
    total: taxSummary.grandTotal,
    issueDate,
    dueDate,
    status: hydratedOrder.paymentStatus === 'success' ? 'paid' : 'pending',
    buyer: buildBillingParty({ user: buyer, fallbackName: 'Buyer' }),
    seller: buildBillingParty({ user: seller, fallbackName: 'Seller', gstNumber: '29ABCDE1234F1Z5' }),
    lineItems: [lineItem],
    taxSummary,
    meta: {
      linkedOrderId: hydratedOrder._id,
      currency: hydratedOrder.currency || 'INR',
      placeOfSupply: derivePlaceOfSupply({ buyer, seller }),
      pdfGeneratedAt: null
    }
  });
};

export const backfillInvoiceRecords = async () => {
  const invoices = await Invoice.find({
    $or: [
      { buyer: { $exists: false } },
      { seller: { $exists: false } },
      { lineItems: { $exists: false } },
      { taxSummary: { $exists: false } }
    ]
  });

  for (const invoice of invoices) {
    let buyer = {};
    let seller = {};

    if (invoice.meta?.linkedOrderId) {
      const order = await Order.findById(invoice.meta.linkedOrderId).populate('buyer').populate('seller').lean();
      buyer = buildBillingParty({ user: order?.buyer, fallbackName: 'Buyer' });
      seller = buildBillingParty({ user: order?.seller, fallbackName: order?.seller?.name || invoice.partyName, gstNumber: '29ABCDE1234F1Z5' });
    } else if (invoice.meta?.linkedPurchaseId) {
      const purchase = await Purchase.findOne({ purchaseId: invoice.meta.linkedPurchaseId }).lean();
      seller = {
        name: safeText(purchase?.supplierName, invoice.partyName),
        phone: safeText(purchase?.contactDetails),
        gstNumber: '27ABCDE1234F1Z5',
        addressLine: safeText(purchase?.supplierName),
        city: 'Unknown',
        state: 'Maharashtra',
        country: 'India',
        postalCode: ''
      };
      buyer = {
        name: 'MarketLoop Procurement',
        email: 'ops@marketloop.local',
        phone: '9000000000',
        gstNumber: '29ABCDE1234F1Z5',
        addressLine: 'MarketLoop Operations',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: ''
      };
    }

    const normalized = await buildNormalizedInvoiceDocument({
      ...invoice.toObject(),
      buyer: invoice.buyer || buyer,
      seller: invoice.seller || seller
    });

    invoice.buyer = normalized.buyer;
    invoice.seller = normalized.seller;
    invoice.lineItems = normalized.lineItems;
    invoice.taxSummary = normalized.taxSummary;
    invoice.meta = normalized.meta;
    invoice.total = normalized.total;
    invoice.linkedReference = normalized.linkedReference;
    await invoice.save();
  }
};

const escapePdfText = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const buildPdf = ({ lines }) => {
  const pageHeight = 800;
  const lineHeight = 14;
  const maxLinesPerPage = 48;
  const pages = [];
  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];
  const contentIds = [];

  pages.forEach((pageLines) => {
    const streamLines = [
      'BT',
      '/F1 11 Tf',
      `${lineHeight} TL`,
      `40 ${pageHeight} Td`
    ];

    pageLines.forEach((line, lineIndex) => {
      const prefix = lineIndex === 0 ? '' : 'T* ';
      streamLines.push(`${prefix}(${escapePdfText(line)}) Tj`);
    });
    streamLines.push('ET');

    const stream = streamLines.join('\n');
    const streamId = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`);
    contentIds.push(streamId);
    pageIds.push(addObject(''));
  });

  const pagesId = addObject('');
  pageIds.forEach((pageId, index) => {
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
  });
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

export const generateInvoicePdfBuffer = async (invoiceDoc) => {
  const invoice = await buildNormalizedInvoiceDocument(invoiceDoc);
  const lines = [
    'MARKETLOOP INVOICE',
    '',
    `Invoice Number: ${invoice.invoiceNumber}`,
    `Invoice Type: ${invoice.invoiceType}`,
    `Status: ${invoice.status}`,
    `Issue Date: ${safeDate(invoice.issueDate).toLocaleString('en-IN')}`,
    `Due Date: ${invoice.dueDate ? safeDate(invoice.dueDate).toLocaleString('en-IN') : '-'}`,
    `Linked Reference: ${invoice.linkedReference || '-'}`,
    `Place of Supply: ${invoice.meta?.placeOfSupply || '-'}`,
    '',
    'BUYER DETAILS',
    `Name: ${invoice.buyer.name}`,
    `Email: ${invoice.buyer.email || '-'}`,
    `Phone: ${invoice.buyer.phone || '-'}`,
    `Address: ${invoice.buyer.addressLine || '-'}, ${invoice.buyer.city || ''} ${invoice.buyer.state || ''} ${invoice.buyer.country || ''}`.trim(),
    `GST: ${invoice.buyer.gstNumber || '-'}`,
    '',
    'SELLER DETAILS',
    `Name: ${invoice.seller.name}`,
    `Email: ${invoice.seller.email || '-'}`,
    `Phone: ${invoice.seller.phone || '-'}`,
    `Address: ${invoice.seller.addressLine || '-'}, ${invoice.seller.city || ''} ${invoice.seller.state || ''} ${invoice.seller.country || ''}`.trim(),
    `GST: ${invoice.seller.gstNumber || '-'}`,
    '',
    'ITEMS'
  ];

  invoice.lineItems.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.itemName}`,
      `   Qty: ${item.quantity} ${item.unit} | Rate: Rs. ${item.rate} | Gross: Rs. ${item.grossAmount}`,
      `   Discount: Rs. ${item.discount} | Offer: ${item.offerLabel || '-'} | HSN: ${item.hsnCode}`,
      `   Taxable: Rs. ${item.taxableAmount} | Tax Rate: ${item.taxRate}% | Tax: Rs. ${item.taxAmount} | Line Total: Rs. ${item.total}`
    );
  });

  lines.push(
    '',
    'TAX SUMMARY',
    `Gross Amount: Rs. ${invoice.taxSummary.grossAmount}`,
    `Discount Total: Rs. ${invoice.taxSummary.discountTotal}`,
    `Taxable Amount: Rs. ${invoice.taxSummary.taxableAmount}`,
    `CGST (${invoice.taxSummary.cgstRate}%): Rs. ${invoice.taxSummary.cgstAmount}`,
    `SGST (${invoice.taxSummary.sgstRate}%): Rs. ${invoice.taxSummary.sgstAmount}`,
    `IGST (${invoice.taxSummary.igstRate}%): Rs. ${invoice.taxSummary.igstAmount}`,
    `Additional Charges: Rs. ${invoice.taxSummary.additionalCharges}`,
    `Delivery Charges: Rs. ${invoice.taxSummary.deliveryCharges}`,
    `Grand Total: Rs. ${invoice.taxSummary.grandTotal}`
  );

  return buildPdf({ lines });
};
