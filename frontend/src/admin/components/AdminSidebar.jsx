export default function AdminSidebar({ sections, activeSection, onSelect }) {
  return (
    <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <p className="px-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">Marketplace admin</p>
      <div className="mt-4 space-y-1">
        {sections.map((section) => {
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              <span>{section.label}</span>
              {active && <span className="text-xs font-black uppercase tracking-[0.16em]">Live</span>}
            </button>
          );
        })}

      </div>
    </aside>
  );
}
