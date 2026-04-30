import useAlerts from './useAlerts.js';
import useAdminRoles from './useAdminRoles.js';
import useBulkExport from './useBulkExport.js';

export default function useAdminHeaderActions(onActivity, onToast) {
  const alerts = useAlerts(onActivity, onToast);
  const roles = useAdminRoles(onActivity, onToast);
  const bulkExport = useBulkExport(onActivity, onToast);

  return {
    alerts,
    roles,
    bulkExport
  };
}
