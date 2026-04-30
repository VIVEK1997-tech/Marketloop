import { X } from 'lucide-react';
import { formatInvoiceDate, formatInvoiceMoney } from '../invoices/invoiceUtils.js';

export default function InvoicePreviewModal({ open, invoice, onClose }) {
  if (!open || !invoice) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-4xl rounded-[1.75rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Invoice preview</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{invoice.invoiceId}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">MarketLoop Finance Workspace</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Bill to</p>
            <p className="mt-2 font-bold text-slate-900 dark:text-slate-100">{invoice.partyName}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.partyType}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{invoice.billingAddress}</p>
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">GSTIN: {invoice.partyGstin}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Invoice meta</p>
            <div className="mt-2 space-y-2 text-sm">
              <p>Issue date: <span className="font-bold">{formatInvoiceDate(invoice.issueDate)}</span></p>
              <p>Due date: <span className="font-bold">{formatInvoiceDate(invoice.dueDate)}</span></p>
              <p>Linked record: <span className="font-bold">{invoice.linkedRecordType} {invoice.linkedRecordId}</span></p>
              <p>Owner: <span className="font-bold">{invoice.invoiceOwner}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{formatInvoiceMoney(item.rate)}</td>
                  <td className="px-4 py-3">{formatInvoiceMoney(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Notes</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{invoice.notes}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Taxable amount</span><span className="font-bold">{formatInvoiceMoney(invoice.taxableAmount)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span className="font-bold">{formatInvoiceMoney(invoice.discount)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="font-bold">{formatInvoiceMoney(invoice.shippingCharge)}</span></div>
              <div className="flex justify-between"><span>CGST</span><span className="font-bold">{formatInvoiceMoney(invoice.cgst)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span className="font-bold">{formatInvoiceMoney(invoice.sgst)}</span></div>
              <div className="flex justify-between"><span>IGST</span><span className="font-bold">{formatInvoiceMoney(invoice.igst)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-black dark:border-slate-700"><span>Grand total</span><span>{formatInvoiceMoney(invoice.grandTotal)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

