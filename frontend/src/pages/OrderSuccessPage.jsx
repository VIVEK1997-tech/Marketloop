import { CheckCircle2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const receipt = searchParams.get('receipt');
  const gateway = searchParams.get('gateway');
  const gatewayLabelMap = {
    payu_india: 'PayU',
    phonepe_pg: 'PhonePe',
    cashfree_payments: 'Cashfree',
    razorpay_checkout: 'Razorpay'
  };
  const gatewayLabel = gatewayLabelMap[gateway] || 'MarketLoop checkout';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900 dark:bg-slate-900">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 size={40} />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">Order confirmed</p>
        <h1 className="mt-2 text-4xl font-black text-slate-900 dark:text-slate-100">Payment successful</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          Your {gatewayLabel} payment has been verified and your MarketLoop order is now confirmed.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Order ID</p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">{orderId || 'Pending'}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Receipt</p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">{receipt || 'Generated'}</p>
          </div>
          <div className="rounded-[1.5rem] bg-slate-50 p-4 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Amount paid</p>
            <p className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="btn" to="/payments">Open payment history</Link>
          <Link className="btn-secondary" to="/invoices">View invoices</Link>
          <Link className="btn-secondary" to="/">Continue shopping</Link>
        </div>
      </section>
    </div>
  );
}
