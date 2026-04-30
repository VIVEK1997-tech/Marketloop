export default function DeliverySlotCard() {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Delivery slot</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Express delivery</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          10-15 min
        </span>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
          Fresh stock slot
        </span>
      </div>
    </article>
  );
}
