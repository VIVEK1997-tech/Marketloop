import { useMemo, useState } from 'react';
import { generateHeaderAlerts } from '../header/generateAdminHeaderData.js';

export default function useAlerts(onActivity, onToast) {
  const [alerts, setAlerts] = useState(() => generateHeaderAlerts(50));
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const unresolvedCount = useMemo(
    () => alerts.filter((alert) => !['Resolved', 'Dismissed'].includes(alert.status) && ['Warning', 'Danger', 'Critical'].includes(alert.level)).length,
    [alerts]
  );

  const latestAlerts = useMemo(
    () => [...alerts].sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp)).slice(0, 8),
    [alerts]
  );

  const selectedAlert = useMemo(() => alerts.find((alert) => alert.id === selectedAlertId) || null, [alerts, selectedAlertId]);

  const updateAlertStatus = (alertId, nextStatus, actionLabel) => {
    setAlerts((current) =>
      current.map((alert) => (alert.id === alertId ? { ...alert, status: nextStatus, timestamp: new Date().toISOString() } : alert))
    );
    const alert = alerts.find((item) => item.id === alertId);
    if (alert) {
      onActivity?.({
        title: actionLabel,
        meta: `${alert.alertTitle} · ${nextStatus}`,
        time: 'Just now',
        type: nextStatus === 'Resolved' ? 'success' : nextStatus === 'Dismissed' ? 'neutral' : 'warning'
      });
      onToast?.(actionLabel, `${alert.alertId} updated to ${nextStatus}.`);
    }
  };

  return {
    alerts,
    latestAlerts,
    unresolvedCount,
    isOpen,
    selectedAlert,
    openDropdown: () => setIsOpen(true),
    closeDropdown: () => {
      setIsOpen(false);
      setSelectedAlertId(null);
    },
    toggleDropdown: () => setIsOpen((current) => !current),
    viewAlertDetails: (alertId) => setSelectedAlertId(alertId),
    clearSelectedAlert: () => setSelectedAlertId(null),
    markAcknowledged: (alertId) => updateAlertStatus(alertId, 'Acknowledged', 'Alert acknowledged'),
    markResolved: (alertId) => updateAlertStatus(alertId, 'Resolved', 'Alert resolved'),
    dismissAlert: (alertId) => updateAlertStatus(alertId, 'Dismissed', 'Alert dismissed')
  };
}
