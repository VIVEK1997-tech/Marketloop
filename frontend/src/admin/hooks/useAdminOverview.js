import { useEffect, useMemo, useState } from 'react';
import { downloadCsv, downloadZip } from '../exportUtils.js';
import {
  buildOverviewActivity,
  buildOverviewHealth,
  buildOverviewInsights,
  buildOverviewRecentRecords,
  buildOverviewRisks,
  buildOverviewStats,
  buildOverviewTrends,
  createOverviewDatasets,
  filterOverviewDatasets
} from '../overview/overviewData.js';

const initialFilters = {
  search: '',
  dateFrom: '',
  dateTo: '',
  module: 'all',
  riskLevel: 'all'
};

export default function useAdminOverview(onNavigateSection, onToast) {
  const [datasets, setDatasets] = useState(() => createOverviewDatasets());
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActivityFeed(buildOverviewActivity(datasets));
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [datasets]);

  useEffect(() => {
    if (loading) return;
    setRecalculating(true);
    const timer = setTimeout(() => setRecalculating(false), 280);
    return () => clearTimeout(timer);
  }, [filters, loading]);

  const filtered = useMemo(() => filterOverviewDatasets(datasets, filters), [datasets, filters]);
  const stats = useMemo(() => buildOverviewStats(filtered), [filtered]);
  const trends = useMemo(() => buildOverviewTrends(filtered), [filtered]);
  const insights = useMemo(() => buildOverviewInsights(filtered), [filtered]);
  const risks = useMemo(() => buildOverviewRisks(filtered), [filtered]);
  const recentRecords = useMemo(() => buildOverviewRecentRecords(filtered), [filtered]);
  const health = useMemo(() => buildOverviewHealth(filtered), [filtered]);

  const addActivity = (title, meta, type = 'info') => {
    setActivityFeed((current) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title,
        meta,
        type,
        time: new Date().toISOString()
      },
      ...current
    ].slice(0, 14));
  };

  const quickActions = [
    { id: 'approve-seller', label: 'Approve new seller', module: 'sellers', action: () => { addActivity('Seller approval opened', 'KYC approval review queued', 'warning'); onNavigateSection('sellers'); onToast?.('Seller queue opened', 'Navigated to Seller Management.'); } },
    { id: 'resolve-alert', label: 'Resolve alert', module: 'safety', action: () => { addActivity('Alert resolved', 'Manual safety review completed', 'success'); onNavigateSection('safety'); onToast?.('Alert resolved', 'Recent safety action logged.'); } },
    { id: 'reorder', label: 'Create reorder request', module: 'inventory', action: () => { addActivity('Reorder request created', 'Low stock reorder suggestion generated', 'warning'); onNavigateSection('inventory'); onToast?.('Reorder suggestion created', 'Inventory reorder action logged.'); } },
    { id: 'invoice', label: 'Generate invoice', module: 'invoices', action: () => { addActivity('Invoice generation opened', 'Invoice workflow launched from overview', 'success'); onNavigateSection('invoices'); onToast?.('Invoice workflow opened', 'Navigated to Invoice Workspace.'); } },
    { id: 'pay-bill', label: 'Pay bill', module: 'bills', action: () => { addActivity('Bill payment opened', 'Payable review opened for finance', 'warning'); onNavigateSection('bills'); onToast?.('Bill payment opened', 'Navigated to Bills Payable.'); } },
    { id: 'export-records', label: 'Export selected records', module: 'reports', action: () => { downloadCsv('overview-export', stats.map((card) => ({ label: card.label, value: card.value, module: card.module }))); addActivity('Overview export created', 'Overview summary exported to CSV', 'success'); onToast?.('Overview exported', 'Overview summary CSV downloaded.'); } },
    { id: 'assign-admin', label: 'Assign admin', module: 'safety', action: () => { addActivity('Admin assignment requested', 'Manual assignment placeholder triggered', 'info'); onToast?.('Assignment placeholder', 'Assignment action logged for follow-up.'); } },
    { id: 'mark-risk', label: 'Mark risk as reviewed', module: 'safety', action: () => { addActivity('Risk marked reviewed', 'Overview risk item acknowledged', 'success'); onToast?.('Risk reviewed', 'Risk acknowledgement logged.'); } }
  ];

  const refreshDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      const next = createOverviewDatasets();
      setDatasets(next);
      setActivityFeed(buildOverviewActivity(next));
      setLoading(false);
      addActivity('Dashboard refreshed', 'Overview metrics refreshed from deterministic sample data', 'success');
      onToast?.('Dashboard refreshed', 'Overview metrics were recalculated.');
    }, 700);
  };

  const exportOverviewCsv = () => {
    downloadCsv('admin-overview', stats.map((card) => ({ metric: card.label, value: card.value, module: card.module })));
    addActivity('Overview CSV exported', `${stats.length} overview metrics exported`, 'success');
    onToast?.('Overview CSV exported', 'Overview metrics were exported to CSV.');
  };

  const generateSnapshotZip = () => {
    downloadZip('dashboard-snapshot', [
      { name: 'overview-metrics', extension: 'txt', content: JSON.stringify(stats, null, 2) },
      { name: 'overview-risks', extension: 'txt', content: JSON.stringify(risks, null, 2) },
      { name: 'overview-activity', extension: 'txt', content: JSON.stringify(activityFeed.slice(0, 10), null, 2) }
    ]);
    addActivity('Dashboard snapshot generated', 'ZIP placeholder generated for overview snapshot', 'success');
    onToast?.('Snapshot ZIP ready', 'Dashboard snapshot placeholder ZIP downloaded.');
  };

  const selectedCardDetails = selectedCard ? stats.find((card) => card.key === selectedCard) || null : null;

  return {
    filters,
    setFilters,
    resetFilters: () => setFilters(initialFilters),
    loading,
    recalculating,
    stats,
    trends,
    insights,
    risks,
    recentRecords,
    activityFeed,
    health,
    quickActions,
    refreshDashboard,
    exportOverviewCsv,
    generateSnapshotZip,
    openCard: (cardKey) => setSelectedCard(cardKey),
    closeCard: () => setSelectedCard(null),
    selectedCard: selectedCardDetails,
    goToModule: (moduleId) => onNavigateSection(moduleId)
  };
}
