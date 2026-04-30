export const reportsRowsPerPage = [10, 25, 50, 100];
export const reportStatusOptions = ['all', 'Ready', 'Queued', 'Running', 'Failed', 'Scheduled', 'Archived'];

export const formatReportDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Not scheduled';

export const filterReports = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.reportName, row.reportCategory, row.ownerAdmin, row.status, row.formats.join(', '), row.reportId]
        .some((value) => String(value || '').toLowerCase().includes(query));

    const matchesCategory = filters.category === 'all' || row.reportCategory === filters.category;
    const matchesStatus = filters.status === 'all' || row.status === filters.status;
    const matchesFormat = filters.format === 'all' || row.formats.includes(filters.format);
    const matchesOwner = filters.ownerAdmin === 'all' || row.ownerAdmin === filters.ownerAdmin;
    const matchesFrequency = filters.scheduleFrequency === 'all' || row.scheduleFrequency === filters.scheduleFrequency;
    const matchesVisibility = filters.visibility === 'all' || row.visibility === filters.visibility;
    const matchesRunFrom = !filters.lastRunFrom || (row.lastRunAt && new Date(row.lastRunAt) >= new Date(filters.lastRunFrom));
    const matchesRunTo = !filters.lastRunTo || (row.lastRunAt && new Date(row.lastRunAt) <= new Date(filters.lastRunTo));
    const matchesScheduledOnly = !filters.scheduledOnly || row.scheduleFrequency !== 'None';
    const matchesFailedOnly = !filters.failedOnly || row.status === 'Failed';

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesFormat &&
      matchesOwner &&
      matchesFrequency &&
      matchesVisibility &&
      matchesRunFrom &&
      matchesRunTo &&
      matchesScheduledOnly &&
      matchesFailedOnly
    );
  });

export const sortReports = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    if (sortBy === 'reportName') return multiplier * left.reportName.localeCompare(right.reportName);
    if (sortBy === 'reportCategory') return multiplier * left.reportCategory.localeCompare(right.reportCategory);
    if (sortBy === 'lastRunAt') return multiplier * ((new Date(left.lastRunAt || 0)) - (new Date(right.lastRunAt || 0)));
    if (sortBy === 'nextScheduledRun') return multiplier * ((new Date(left.nextScheduledRun || 0)) - (new Date(right.nextScheduledRun || 0)));
    if (sortBy === 'status') return multiplier * left.status.localeCompare(right.status);
    if (sortBy === 'totalRows') return multiplier * (left.totalRows - right.totalRows);
    if (sortBy === 'fileSize') return multiplier * (left.fileSizeBytes - right.fileSizeBytes);
    return multiplier * left.reportId.localeCompare(right.reportId);
  });
};

export const paginateReports = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getReportsPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};
