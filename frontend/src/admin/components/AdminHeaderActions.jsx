import { useEffect, useRef } from 'react';
import AlertsButton from './AlertsButton.jsx';
import AlertsDropdown from './AlertsDropdown.jsx';
import AdminRolesButton from './AdminRolesButton.jsx';
import AdminRolesDrawer from './AdminRolesDrawer.jsx';
import BulkZipExportButton from './BulkZipExportButton.jsx';
import BulkExportModal from './BulkExportModal.jsx';
import ExportProgressModal from './ExportProgressModal.jsx';

const moduleToSection = {
  Procurement: 'procurement',
  'Quality Check': 'quality',
  Inventory: 'inventory',
  Invoices: 'invoices',
  Bills: 'bills',
  Reports: 'reports',
  'Safety & Support': 'safety'
};

export default function AdminHeaderActions({ controls, onNavigateSection }) {
  const alertsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (controls.alerts.isOpen && alertsRef.current && !alertsRef.current.contains(event.target)) {
        controls.alerts.closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [controls.alerts]);

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative" ref={alertsRef}>
        <AlertsButton count={controls.alerts.unresolvedCount} onClick={controls.alerts.toggleDropdown} />
        <AlertsDropdown
          open={controls.alerts.isOpen}
          alerts={controls.alerts.latestAlerts}
          selectedAlert={controls.alerts.selectedAlert}
          onClose={controls.alerts.closeDropdown}
          onViewDetails={controls.alerts.viewAlertDetails}
          onBack={controls.alerts.clearSelectedAlert}
          onAcknowledge={controls.alerts.markAcknowledged}
          onResolve={controls.alerts.markResolved}
          onDismiss={controls.alerts.dismissAlert}
          onOpenModule={(moduleName) => {
            controls.alerts.closeDropdown();
            onNavigateSection(moduleToSection[moduleName] || 'safety');
          }}
          onViewAll={() => {
            controls.alerts.closeDropdown();
            onNavigateSection('safety');
          }}
        />
      </div>

      <AdminRolesButton count={controls.roles.roles.length} onClick={controls.roles.openDrawer} />
      <BulkZipExportButton onClick={controls.bulkExport.openModal} disabled={controls.bulkExport.isRunning} />

      <AdminRolesDrawer
        open={controls.roles.isOpen}
        roles={controls.roles.roles}
        selectedRole={controls.roles.selectedRole}
        onClose={controls.roles.closeDrawer}
        onViewRole={controls.roles.viewRole}
        onAddRole={controls.roles.addRole}
        onEditRole={controls.roles.editRole}
        onDuplicateRole={controls.roles.duplicateRole}
        onToggleStatus={controls.roles.toggleRoleStatus}
        onAssignUsers={controls.roles.assignUsersPlaceholder}
        onExportRoles={controls.roles.exportRoles}
      />

      <BulkExportModal
        open={controls.bulkExport.isOpen}
        onClose={controls.bulkExport.closeModal}
        modules={controls.bulkExport.modules}
        contentOptions={controls.bulkExport.contentOptions}
        form={controls.bulkExport.form}
        error={controls.bulkExport.error}
        estimatedRecordCount={controls.bulkExport.estimatedRecordCount}
        onToggleModule={controls.bulkExport.toggleModule}
        onToggleContent={controls.bulkExport.toggleContent}
        onFieldChange={(key, value) => controls.bulkExport.setForm((current) => ({ ...current, [key]: value }))}
        onStartExport={controls.bulkExport.startExport}
        isRunning={controls.bulkExport.isRunning}
      />

      <ExportProgressModal
        open={controls.bulkExport.progressOpen}
        progress={controls.bulkExport.progress}
        isRunning={controls.bulkExport.isRunning}
        downloadReady={controls.bulkExport.downloadReady}
        onDownload={controls.bulkExport.downloadArchive}
        onClose={controls.bulkExport.closeProgress}
      />
    </div>
  );
}
