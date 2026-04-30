const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function PriceSummary({ subtotal, deliveryFee, total, className = '' }) {
  return (
    <div className={`rounded-[1.5rem] bg-slate-50 p-5 dark:bg-slate-800 ${className}`.trim()}>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Item subtotal</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Delivery fee</span>
          <span className="font-bold">{deliveryFee ? formatCurrency(deliveryFee) : 'FREE'}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700" />
        <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-slate-100">
          <span>Estimated total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
