export const safetyRowsPerPage = [10, 25, 50, 100];

export const formatSafetyDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const filterAlerts = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        row.alertTitle,
        row.details,
        row.alertType,
        row.alertId,
        row.linkedRecordId,
        row.assignedAdmin
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesLevel = filters.alertLevel === 'all' || row.level === filters.alertLevel;
    const matchesStatus = filters.alertStatus === 'all' || row.status === filters.alertStatus;
    const matchesType = filters.alertType === 'all' || row.alertType === filters.alertType;
    const matchesAdmin = filters.assignedAdmin === 'all' || row.assignedAdmin === filters.assignedAdmin;
    const matchesUnresolved = !filters.unresolvedOnly || !['Resolved', 'Dismissed'].includes(row.status);
    const matchesFrom = !filters.createdFrom || new Date(row.createdAt) >= new Date(filters.createdFrom);
    const matchesTo = !filters.createdTo || new Date(row.createdAt) <= new Date(filters.createdTo);

    return matchesSearch && matchesLevel && matchesStatus && matchesType && matchesAdmin && matchesUnresolved && matchesFrom && matchesTo;
  });

export const filterComplaints = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        row.complaintId,
        row.complaintType,
        row.againstName,
        row.raisedBy,
        row.linkedOrderId,
        row.linkedPaymentId,
        row.assignedAdmin
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesType = filters.complaintType === 'all' || row.complaintType === filters.complaintType;
    const matchesStatus = filters.complaintStatus === 'all' || row.status === filters.complaintStatus;
    const matchesSeverity = filters.severity === 'all' || row.severity === filters.severity;
    const matchesAdmin = filters.assignedAdmin === 'all' || row.assignedAdmin === filters.assignedAdmin;
    const matchesBlockedOnly = !filters.blockedOnly || row.isBlocked;
    const matchesSuspendedOnly = !filters.suspendedOnly || row.isSuspended;
    const matchesUnresolved = !filters.unresolvedOnly || !['Resolved', 'Rejected'].includes(row.status);
    const matchesFrom = !filters.createdFrom || new Date(row.createdAt) >= new Date(filters.createdFrom);
    const matchesTo = !filters.createdTo || new Date(row.createdAt) <= new Date(filters.createdTo);

    return matchesSearch && matchesType && matchesStatus && matchesSeverity && matchesAdmin && matchesBlockedOnly && matchesSuspendedOnly && matchesUnresolved && matchesFrom && matchesTo;
  });

export const sortSafetyRows = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'createdAt') return multiplier * (new Date(left.createdAt) - new Date(right.createdAt));
    if (sortBy === 'updatedAt') return multiplier * (new Date(left.updatedAt) - new Date(right.updatedAt));
    if (sortBy === 'severity') return multiplier * String(left.severity || left.level).localeCompare(String(right.severity || right.level));
    if (sortBy === 'level') return multiplier * String(left.level || '').localeCompare(String(right.level || ''));
    if (sortBy === 'status') return multiplier * String(left.status || '').localeCompare(String(right.status || ''));
    if (sortBy === 'assignedAdmin') return multiplier * String(left.assignedAdmin || '').localeCompare(String(right.assignedAdmin || ''));
    return multiplier * String(left.id || '').localeCompare(String(right.id || ''));
  });
};

export const paginateSafetyRows = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getSafetyPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};
