import { BadgeCheck, Download, ShieldAlert, Tags, UserRoundPlus, XCircle } from 'lucide-react';
import BulkActionToolbar from './BulkActionToolbar.jsx';

export default function QualityBulkActionsBar({ selectedCount, onAction }) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      title="Bulk quality actions"
      entityLabel="quality inspections"
      actions={[
        { key: 'approve', label: 'Approve for sale', icon: BadgeCheck },
        { key: 'discount', label: 'Discount sale', icon: Tags },
        { key: 'reject', label: 'Reject & return', icon: XCircle },
        { key: 'quarantine', label: 'Quarantine batch', icon: ShieldAlert },
        { key: 'assign', label: 'Assign inspector', icon: UserRoundPlus },
        { key: 'export', label: 'Export selected', icon: Download }
      ]}
      onAction={onAction}
    />
  );
}

