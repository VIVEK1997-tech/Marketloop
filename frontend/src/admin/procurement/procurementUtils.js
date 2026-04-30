export const procurementRowsPerPage = [10, 25, 50, 100];
export const procurementStatuses = ['all', 'Draft', 'Requested', 'Approved', 'Ordered', 'Partially Received', 'Fully Received', 'Closed', 'Rejected', 'Archived'];
export const procurementPriorities = ['all', 'Low', 'Medium', 'High', 'Urgent'];

export const formatProcurementDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const filterProcurements = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        row.procurementId,
        row.supplier,
        row.requestTitle,
        row.category,
        row.region,
        row.assignedAdmin
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesStatus = filters.status === 'all' || row.status === filters.status;
    const matchesCategory = filters.category === 'all' || row.category === filters.category;
    const matchesPriority = filters.priority === 'all' || row.priority === filters.priority;
    const matchesSupplier = filters.supplier === 'all' || row.supplier === filters.supplier;
    const matchesRegion = filters.region === 'all' || row.region === filters.region;
    const qualityMin = filters.qualityMin === '' ? -Infinity : Number(filters.qualityMin);
    const qualityMax = filters.qualityMax === '' ? Infinity : Number(filters.qualityMax);
    const matchesQuality = row.qualityScore >= qualityMin && row.qualityScore <= qualityMax;
    const rejectionThreshold = filters.rejectionThreshold === '' ? Infinity : Number(filters.rejectionThreshold);
    const matchesRejection = row.rejectionRate <= rejectionThreshold;
    const matchesFrom = !filters.deliveryFrom || new Date(row.expectedDeliveryDate) >= new Date(filters.deliveryFrom);
    const matchesTo = !filters.deliveryTo || new Date(row.expectedDeliveryDate) <= new Date(filters.deliveryTo);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory &&
      matchesPriority &&
      matchesSupplier &&
      matchesRegion &&
      matchesQuality &&
      matchesRejection &&
      matchesFrom &&
      matchesTo
    );
  });

export const sortProcurements = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'createdAt') return multiplier * (new Date(left.createdAt) - new Date(right.createdAt));
    if (sortBy === 'expectedDeliveryDate') return multiplier * (new Date(left.expectedDeliveryDate) - new Date(right.expectedDeliveryDate));
    if (sortBy === 'qualityScore') return multiplier * (left.qualityScore - right.qualityScore);
    if (sortBy === 'rejectionRate') return multiplier * (left.rejectionRate - right.rejectionRate);
    if (sortBy === 'quantityPlan') return multiplier * (left.quantityPlan - right.quantityPlan);
    if (sortBy === 'status') return multiplier * left.status.localeCompare(right.status);
    return multiplier * left.procurementId.localeCompare(right.procurementId);
  });
};

export const paginateProcurements = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getProcurementPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};

