const toneMap = {
  CSV: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  PDF: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  ZIP: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  XLSX: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
};

export default function ExportFormatBadge({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${toneMap[value] || toneMap.CSV}`}>
      {value}
    </span>
  );
}
