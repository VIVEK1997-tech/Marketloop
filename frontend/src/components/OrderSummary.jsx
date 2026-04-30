const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderSummary({ product, quantity, subtotal, deliveryFee, total }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Order summary</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{product.title}</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>{quantity} x {formatCurrency(product.price)}</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Delivery fee</span>
          <span className="font-bold">{deliveryFee ? formatCurrency(deliveryFee) : 'FREE'}</span>
        </div>
        <div className="border-t border-slate-200 pt-3 dark:border-slate-700" />
        <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-slate-100">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </article>
  );
}
