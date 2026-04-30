export default function CategoryChips({ chips, activeLabel, onSelect }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-3">
        {chips.map((chip) => {
          const active = activeLabel === chip.label;
          return (
            <button
              key={chip.label}
              type="button"
              onClick={() => onSelect(chip)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
