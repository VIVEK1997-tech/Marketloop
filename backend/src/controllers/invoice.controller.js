import Invoice from '../models/Invoice.js';
import { findAccessibleInvoice, generateInvoicePdfBuffer, listAccessibleInvoices } from '../services/invoice.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const getInvoices = async (req, res) => {
  const invoices = await listAccessibleInvoices({ user: req.user });
  return sendSuccess(res, {
    invoices: invoices.map((invoice) => ({
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.invoiceType,
      linkedReference: invoice.linkedReference,
      partyName: invoice.partyName,
      total: invoice.total,
      formattedTotal: formatCurrency(invoice.total),
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      buyerName: invoice.buyer?.name || '',
      sellerName: invoice.seller?.name || '',
      detailPath: `/invoices/${invoice.invoiceNumber}`
    }))
  });
};

export const getInvoiceByIdOrNumber = async (req, res) => {
  const invoice = await findAccessibleInvoice({ user: req.user, invoiceIdOrNumber: req.params.invoiceIdOrNumber });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  return sendSuccess(res, { invoice });
};

export const downloadInvoicePdf = async (req, res) => {
  const invoice = await findAccessibleInvoice({ user: req.user, invoiceIdOrNumber: req.params.invoiceIdOrNumber });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const pdfBuffer = await generateInvoicePdfBuffer(invoice);
  await Invoice.updateOne({ _id: invoice._id }, { $set: { 'meta.pdfGeneratedAt': new Date() } });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
  res.send(pdfBuffer);
};
