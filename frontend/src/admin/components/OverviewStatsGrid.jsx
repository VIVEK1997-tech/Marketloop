import OverviewStatCard from './OverviewStatCard.jsx';

export default function OverviewStatsGrid({ cards, loading, onCardClick }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {loading
        ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-slate-800" />)
        : cards.map((card) => <OverviewStatCard key={card.key} card={card} onClick={onCardClick} />)}
    </div>
  );
}
