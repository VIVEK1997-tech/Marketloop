import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { api, extractApiData, getErrorMessage } from '../services/api.js';
import { downloadInvoicePdf, formatInvoiceCurrency, formatInvoiceDate } from '../utils/invoice.js';

const PartyCard = ({ title, party }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{title}</p>
    <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
      <p className="text-lg font-black text-slate-900 dark:text-slate-100">{party?.name || '-'}</p>
      <p>{party?.email || '-'}</p>
      <p>{party?.phone || '-'}</p>
      <p>{[party?.addressLine, party?.city, party?.state, party?.country].filter(Boolean).join(', ') || '-'}</p>
      <p>GST: {party?.gstNumber || '-'}</p>
    </div>
  </div>
);

export default function InvoiceDetails() {
  const { invoiceIdOrNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${invoiceIdOrNumber}`)
      .then((response) => setInvoice(extractApiData(response).invoice))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [invoiceIdOrNumber]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadInvoicePdf(api, invoiceIdOrNumber);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p className="card">Loading invoice...</p>;
  if (error) return <p className="card text-red-700">{error}</p>;
  if (!invoice) return <p className="card">Invoice not found.</p>;

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-subtitle">Invoice details</p>
            <h1 className="section-title mt-2">{invoice.invoiceNumber}</h1>
            <p className="mt-2 text-sm text-slate-500">{invoice.invoiceType} invoice linked to {invoice.linkedReference || '-'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary py-2" to="/invoices">Back to invoices</Link>
            <button className="btn gap-2 py-2" onClick={handleDownload} disabled={downloading}>
              <Download size={16} /> {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Status</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{invoice.status}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Issue date</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{formatInvoiceDate(invoice.issueDate)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Due date</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{formatInvoiceDate(invoice.dueDate)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Grand total</p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{formatInvoiceCurrency(invoice.taxSummary?.grandTotal || invoice.total)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PartyCard title="Buyer" party={invoice.buyer} />
        <PartyCard title="Seller" party={invoice.seller} />
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Line items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                {['Item', 'Qty', 'Unit', 'Rate', 'Gross', 'Discount', 'Offer', 'HSN', 'Taxable', 'Tax', 'Line Total'].map((label) => (
                  <th key={label} className="px-4 py-3 text-left font-black uppercase tracking-[0.14em] text-slate-400">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.lineItems.map((item, index) => (
                <tr key={`${item.itemName}-${index}`}>
                  <td className="px-4 py-3">{item.itemName}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">{item.unit}</td>
                  <td className="px-4 py-3">{formatInvoiceCurrency(item.rate)}</td>
                  <td className="px-4 py-3">{formatInvoiceCurrency(item.grossAmount)}</td>
                  <td className="px-4 py-3">{formatInvoiceCurrency(item.discount)}</td>
                  <td className="px-4 py-3">{item.offerLabel || '-'}</td>
                  <td className="px-4 py-3">{item.hsnCode || '-'}</td>
                  <td className="px-4 py-3">{formatInvoiceCurrency(item.taxableAmount)}</td>
                  <td className="px-4 py-3">{formatInvoiceCurrency(item.taxAmount)}</td>
                  <td className="px-4 py-3 font-bold">{formatInvoiceCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Tax summary</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">CGST</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{invoice.taxSummary?.cgstRate || 0}% | {formatInvoiceCurrency(invoice.taxSummary?.cgstAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">SGST</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{invoice.taxSummary?.sgstRate || 0}% | {formatInvoiceCurrency(invoice.taxSummary?.sgstAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">IGST</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{invoice.taxSummary?.igstRate || 0}% | {formatInvoiceCurrency(invoice.taxSummary?.igstAmount)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Place of supply</p>
              <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">{invoice.meta?.placeOfSupply || '-'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Amount breakdown</h2>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ['Gross amount', invoice.taxSummary?.grossAmount],
              ['Discount total', invoice.taxSummary?.discountTotal],
              ['Taxable amount', invoice.taxSummary?.taxableAmount],
              ['Total tax', invoice.taxSummary?.totalTax],
              ['Additional charges', invoice.taxSummary?.additionalCharges],
              ['Delivery charges', invoice.taxSummary?.deliveryCharges]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{label}</span>
                <span className="font-bold">{formatInvoiceCurrency(value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900 dark:border-slate-800 dark:text-slate-100">
              <span>Grand total</span>
              <span>{formatInvoiceCurrency(invoice.taxSummary?.grandTotal || invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
