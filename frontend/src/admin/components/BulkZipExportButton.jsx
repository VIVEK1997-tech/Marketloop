import { FileArchive } from 'lucide-react';

export default function BulkZipExportButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label="Bulk ZIP Export"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <FileArchive size={16} />
      Bulk ZIP Export
    </button>
  );
}
