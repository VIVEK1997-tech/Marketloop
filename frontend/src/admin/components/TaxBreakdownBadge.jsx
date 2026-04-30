import { formatInvoiceMoney } from '../invoices/invoiceUtils.js';

export default function TaxBreakdownBadge({ invoice }) {
  return (
    <div className="inline-flex flex-col rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <span>CGST {formatInvoiceMoney(invoice.cgst)}</span>
      <span>SGST {formatInvoiceMoney(invoice.sgst)}</span>
      <span>IGST {formatInvoiceMoney(invoice.igst)}</span>
    </div>
  );
}

