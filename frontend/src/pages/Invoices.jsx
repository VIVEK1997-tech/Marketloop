import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { api, extractApiData, getErrorMessage } from '../services/api.js';
import { downloadInvoicePdf, formatInvoiceCurrency, formatInvoiceDate } from '../utils/invoice.js';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    api.get('/invoices')
      .then((response) => setInvoices(extractApiData(response).invoices || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (invoiceNumber) => {
    setDownloading(invoiceNumber);
    try {
      await downloadInvoicePdf(api, invoiceNumber);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloading('');
    }
  };

  if (loading) return <p className="card">Loading invoices...</p>;

  return (
    <section className="space-y-5">
      <div className="card">
        <p className="section-subtitle">Invoices</p>
        <h1 className="section-title mt-2">View and download your invoices</h1>
        <p className="mt-2 text-sm text-slate-500">Open invoice details to review buyer or seller information, GST summary, discounts, charges, and downloadable PDFs.</p>
      </div>

      {error && <p className="card text-red-700">{error}</p>}

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <article key={invoice.invoiceNumber} className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link className="text-lg font-black text-brand-700 hover:underline" to={`/invoices/${invoice.invoiceNumber}`}>
                {invoice.invoiceNumber}
              </Link>
              <p className="mt-1 text-sm text-slate-500">{invoice.invoiceType} invoice for {invoice.partyName}</p>
              <p className="mt-1 text-sm text-slate-500">Linked to {invoice.linkedReference || '-'}</p>
              <p className="mt-1 text-sm text-slate-500">Issued {formatInvoiceDate(invoice.issueDate)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{formatInvoiceCurrency(invoice.total)}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{invoice.status}</p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Link className="btn-secondary gap-2 py-2" to={`/invoices/${invoice.invoiceNumber}`}>
                  <FileText size={16} /> View details
                </Link>
                <button className="btn gap-2 py-2" onClick={() => handleDownload(invoice.invoiceNumber)} disabled={downloading === invoice.invoiceNumber}>
                  <Download size={16} /> {downloading === invoice.invoiceNumber ? 'Downloading...' : 'Download PDF'}
                </button>
              </div>
            </div>
          </article>
        ))}
        {!invoices.length && <p className="card">No invoices available yet.</p>}
      </div>
    </section>
  );
}
