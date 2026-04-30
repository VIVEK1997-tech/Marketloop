import { ArchiveRestore, BadgeCheck, Download, PackageOpen, PackagePlus, ShieldAlert, ShoppingCart, Truck } from 'lucide-react';
import BulkActionToolbar from './BulkActionToolbar.jsx';

export default function InventoryBulkActionsBar({ selectedCount, onAction }) {
  return (
    <BulkActionToolbar
      selectedCount={selectedCount}
      title="Bulk inventory actions"
      entityLabel="inventory batches"
      actions={[
        { key: 'receive', label: 'Receive stock', icon: PackagePlus },
        { key: 'reserve', label: 'Reserve stock', icon: ShoppingCart },
        { key: 'release', label: 'Release stock', icon: ArchiveRestore },
        { key: 'sold', label: 'Mark sold', icon: Truck },
        { key: 'damaged', label: 'Mark damaged', icon: ShieldAlert },
        { key: 'discount', label: 'Discount sale', icon: BadgeCheck },
        { key: 'reorder', label: 'Create reorder', icon: PackageOpen },
        { key: 'export', label: 'Export selected', icon: Download }
      ]}
      onAction={onAction}
    />
  );
}

