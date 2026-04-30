export default function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-20 z-[80] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[280px] rounded-2xl border px-4 py-3 shadow-lg ${
            toast.tone === 'error' ? 'border-rose-200 bg-white text-rose-700' : 'border-emerald-200 bg-white text-emerald-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black">{toast.title}</p>
              <p className="mt-1 text-sm">{toast.message}</p>
            </div>
            <button type="button" className="text-xs font-bold uppercase tracking-[0.12em]" onClick={() => onDismiss(toast.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
