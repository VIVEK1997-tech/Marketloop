const levelClasses = {
  Info: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  Warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  Critical: 'bg-slate-900 text-white dark:bg-rose-500 dark:text-white'
};

export default function AlertLevelBadge({ level }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${levelClasses[level] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
      {level}
    </span>
  );
}
