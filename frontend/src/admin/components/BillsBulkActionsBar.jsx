import { BellRing, Download, Wallet, XCircle } from 'lucide-react';
import BulkActionToolbar from './BulkActionToolbar.jsx';

export default function BillsBulkActionsBar({ selectedCount, onAction }) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      title="Bulk bills actions"
      entityLabel="bills"
      actions={[
        { key: 'pay', label: 'Pay selected bills', icon: Wallet },
        { key: 'paid', label: 'Mark as paid', icon: Wallet },
        { key: 'pending', label: 'Mark as pending', icon: XCircle },
        { key: 'reminder', label: 'Send reminder', icon: BellRing },
        { key: 'assign', label: 'Assign admin', icon: BellRing },
        { key: 'cancel', label: 'Cancel bills', icon: XCircle },
        { key: 'export', label: 'Export selected', icon: Download }
      ]}
      onAction={onAction}
    />
  );
}
