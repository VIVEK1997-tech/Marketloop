import OverviewSearchBar from './OverviewSearchBar.jsx';
import OverviewFilters from './OverviewFilters.jsx';
import OverviewStatsGrid from './OverviewStatsGrid.jsx';
import OverviewTrendCards from './OverviewTrendCards.jsx';
import OverviewInsightsPanel from './OverviewInsightsPanel.jsx';
import OverviewActivityFeed from './OverviewActivityFeed.jsx';
import OverviewRiskPanel from './OverviewRiskPanel.jsx';
import OverviewQuickActions from './OverviewQuickActions.jsx';
import OverviewRecentRecords from './OverviewRecentRecords.jsx';
import OverviewRecentRegistrations from './OverviewRecentRegistrations.jsx';
import OverviewDetailsDrawer from './OverviewDetailsDrawer.jsx';
import PaymentGatewayStatusPanel from './PaymentGatewayStatusPanel.jsx';
import useAdminOverview from '../hooks/useAdminOverview.js';
import { downloadCsv } from '../exportUtils.js';

export default function AdminOverviewModule({ onNavigateSection, onToast }) {
  const overview = useAdminOverview(onNavigateSection, onToast);

  const exportSelectedRecords = (card) => {
    downloadCsv(`${card.key}-records`, card.records);
    onToast?.('Metric export ready', `${card.label} records exported to CSV.`);
  };

  if (!overview.loading && !overview.stats.some((card) => Number(String(card.value).replace(/[^0-9]/g, '')) > 0)) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        No overview records match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OverviewSearchBar
        value={overview.filters.search}
        onChange={(value) => overview.setFilters((current) => ({ ...current, search: value }))}
        onRefresh={overview.refreshDashboard}
      />

      <OverviewFilters
        filters={overview.filters}
        onChange={(key, value) => overview.setFilters((current) => ({ ...current, [key]: value }))}
        onReset={overview.resetFilters}
      />

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={overview.exportOverviewCsv} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
          Export overview CSV
        </button>
        <button type="button" onClick={overview.generateSnapshotZip} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Generate dashboard snapshot ZIP
        </button>
      </div>

      <OverviewStatsGrid cards={overview.stats} loading={overview.loading || overview.recalculating} onCardClick={overview.openCard} />

      <OverviewTrendCards trends={overview.trends} />

      <OverviewQuickActions actions={overview.quickActions} />

      <PaymentGatewayStatusPanel />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <OverviewInsightsPanel insights={overview.insights} onOpenModule={overview.goToModule} />
        <OverviewRiskPanel risks={overview.risks} health={overview.health} onOpenModule={overview.goToModule} onReviewRisk={() => overview.quickActions.find((item) => item.id === 'mark-risk')?.action()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <OverviewActivityFeed items={overview.activityFeed} />
        <OverviewRecentRegistrations items={overview.insights.registrations} onOpenModule={overview.goToModule} />
      </div>

      <OverviewRecentRecords records={overview.recentRecords} onOpenModule={overview.goToModule} />

      <OverviewDetailsDrawer
        card={overview.selectedCard}
        onClose={overview.closeCard}
        onGoToModule={overview.goToModule}
        onQuickAction={exportSelectedRecords}
      />
    </div>
  );
}
