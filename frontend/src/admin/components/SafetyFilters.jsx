export default function SafetyFilters({
  filters,
  onChange,
  alertOptions,
  complaintOptions,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionChange,
  onReset
}) {
  const selectClasses = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';
  const inputClasses = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900';
  const checkboxLabel = 'inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300';

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <select className={selectClasses} value={filters.alertLevel} onChange={(event) => onChange('alertLevel', event.target.value)}>
          <option value="all">All alert levels</option>
          {alertOptions.levels.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.alertStatus} onChange={(event) => onChange('alertStatus', event.target.value)}>
          <option value="all">All alert statuses</option>
          {alertOptions.statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.alertType} onChange={(event) => onChange('alertType', event.target.value)}>
          <option value="all">All alert types</option>
          {alertOptions.types.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.complaintType} onChange={(event) => onChange('complaintType', event.target.value)}>
          <option value="all">All complaint types</option>
          {complaintOptions.types.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.complaintStatus} onChange={(event) => onChange('complaintStatus', event.target.value)}>
          <option value="all">All complaint statuses</option>
          {complaintOptions.statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.severity} onChange={(event) => onChange('severity', event.target.value)}>
          <option value="all">All severities</option>
          {complaintOptions.severities.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={selectClasses} value={filters.assignedAdmin} onChange={(event) => onChange('assignedAdmin', event.target.value)}>
          <option value="all">All admins</option>
          {[...new Set([...alertOptions.admins, ...complaintOptions.admins])].sort().map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <input className={inputClasses} type="date" value={filters.createdFrom} onChange={(event) => onChange('createdFrom', event.target.value)} />
        <input className={inputClasses} type="date" value={filters.createdTo} onChange={(event) => onChange('createdTo', event.target.value)} />
        <div className="flex items-center gap-2">
          <select className={`${selectClasses} flex-1`} value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
            <option value="createdAt">Sort by created date</option>
            <option value="updatedAt">Sort by updated date</option>
            <option value="severity">Sort by severity</option>
            <option value="level">Sort by alert level</option>
            <option value="status">Sort by status</option>
            <option value="assignedAdmin">Sort by assigned admin</option>
          </select>
          <select className={selectClasses} value={sortDirection} onChange={(event) => onSortDirectionChange(event.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className={checkboxLabel}>
          <input type="checkbox" checked={filters.blockedOnly} onChange={(event) => onChange('blockedOnly', event.target.checked)} />
          Blocked users only
        </label>
        <label className={checkboxLabel}>
          <input type="checkbox" checked={filters.suspendedOnly} onChange={(event) => onChange('suspendedOnly', event.target.checked)} />
          Suspended users only
        </label>
        <label className={checkboxLabel}>
          <input type="checkbox" checked={filters.unresolvedOnly} onChange={(event) => onChange('unresolvedOnly', event.target.checked)} />
          Unresolved only
        </label>
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
