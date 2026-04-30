export default function DeliveryAddressCard() {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-400">Delivery address</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Home address</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Fresh groceries will be delivered to your saved MarketLoop buyer address. Address selection can be expanded in the next pass without changing the checkout flow.
      </p>
    </article>
  );
}
