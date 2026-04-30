export default function PaymentGatewaySelector({ gateway = 'razorpay' }) {
  const label = gateway === 'razorpay' ? 'Razorpay' : gateway;

  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Payment gateway</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{label}</h2>
      <div className="mt-4 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">Selected checkout: Razorpay</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          Cards, UPI, wallets, and net banking are opened only after MarketLoop creates the backend order on the checkout page.
        </p>
      </div>
    </article>
  );
}
