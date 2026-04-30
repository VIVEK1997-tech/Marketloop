import { Archive, Download, FileText, RefreshCcw, Trash2 } from 'lucide-react';
import BulkActionToolbar from './BulkActionToolbar.jsx';

export default function ReportsBulkActionsBar({ selectedCount, onAction }) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      title="Bulk reports actions"
      entityLabel="reports"
      actions={[
        { key: 'generate', label: 'Generate selected', icon: RefreshCcw },
        { key: 'download', label: 'Download selected', icon: Download },
        { key: 'schedule', label: 'Schedule selected', icon: FileText },
        { key: 'archive', label: 'Archive selected', icon: Archive },
        { key: 'delete', label: 'Delete selected', icon: Trash2 },
        { key: 'export', label: 'Export selected list', icon: Download }
      ]}
      onAction={onAction}
    />
  );
}
