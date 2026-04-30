const resolveButtonLabel = (gatewayLabel) => `Pay with ${gatewayLabel}`;

const gatewayDescriptions = {
  razorpay_checkout: 'UPI, cards, wallets, and net banking with MarketLoop checkout.',
  cashfree_payments: 'Hosted Cashfree checkout with sandbox and production support.',
  phonepe_pg: 'PhonePe redirect checkout for UPI, cards, wallets, and net banking.',
  payu_india: 'Alternate secure redirect checkout with PayU for bank and UPI payments.',
  hdfc_smartgateway: 'HDFC SmartGateway session checkout in sandbox mode with verified status return.'
};

export default function PaymentGatewaySelector({
  gateways = [],
  activeGatewayId,
  loadingGatewayId,
  onPay
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Choose payment method</p>
      <div className="mt-4 space-y-3">
        {gateways.map((gateway) => {
          const active = activeGatewayId === gateway.id;
          const disabled = gateway.status === 'unavailable' || Boolean(loadingGatewayId && loadingGatewayId !== gateway.id);
          const busy = loadingGatewayId === gateway.id;
          const label = gateway.company === 'PhonePe Payment Gateway'
            ? 'PhonePe'
            : gateway.company === 'PayU India'
              ? 'PayU'
              : gateway.company;
          const statusBadgeClass = gateway.status === 'ready'
            ? active
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-500'
            : gateway.status === 'available'
              ? 'bg-sky-100 text-sky-700'
              : 'bg-amber-100 text-amber-700';
          const statusLabel = gateway.status === 'ready'
            ? (active ? 'Ready' : 'Ready')
            : gateway.status === 'available'
              ? 'Available'
              : 'Unavailable';

          return (
            <article
              key={gateway.id}
              className={`rounded-[1.25rem] border p-4 transition ${
                active
                  ? 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
                  : 'border-slate-200 bg-white'
              } ${disabled && !busy ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-slate-100">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {gateway.description || gatewayDescriptions[gateway.id] || `Secure MarketLoop checkout with ${label}.`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${statusBadgeClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              {gateway.status === 'available' && gateway.configReasons?.length > 0 && (
                <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700">
                  Setup incomplete: {gateway.configReasons[0]}
                </p>
              )}
              {gateway.status === 'unavailable' && gateway.configReasons?.length > 0 && (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  {gateway.configReasons[0]}
                </p>
              )}

              <button
                type="button"
                onClick={() => onPay(gateway)}
                disabled={disabled}
                className={`mt-4 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition ${
                  disabled
                    ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {busy ? `Opening ${label}...` : resolveButtonLabel(label)}
              </button>
            </article>
          );
        })}
      </div>
    </article>
  );
}
