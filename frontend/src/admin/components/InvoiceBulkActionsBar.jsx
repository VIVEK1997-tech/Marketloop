import { BellRing, Download, FileText, Wallet, XCircle } from 'lucide-react';
import BulkActionToolbar from './BulkActionToolbar.jsx';

export default function InvoiceBulkActionsBar({ selectedCount, onAction }) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      title="Bulk invoice actions"
      entityLabel="invoices"
      actions={[
        { key: 'paid', label: 'Mark as paid', icon: Wallet },
        { key: 'pending', label: 'Mark as pending', icon: XCircle },
        { key: 'reminder', label: 'Send reminder', icon: BellRing },
        { key: 'preview', label: 'Generate preview', icon: FileText },
        { key: 'download', label: 'Download selected', icon: Download },
        { key: 'cancel', label: 'Cancel invoices', icon: XCircle },
        { key: 'export', label: 'Export selected', icon: Download }
      ]}
      onAction={onAction}
    />
  );
}

