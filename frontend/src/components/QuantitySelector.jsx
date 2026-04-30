export default function QuantitySelector({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100"
      >
        -
      </button>
      <span className="min-w-12 text-center text-base font-black text-slate-900 dark:text-slate-100">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white transition hover:bg-emerald-700"
      >
        +
      </button>
    </div>
  );
}
