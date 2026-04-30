export const qualityRowsPerPage = [10, 25, 50, 100];
export const qualityGradeOptions = ['all', 'Green', 'Orange', 'Red'];
export const qualityStatusOptions = ['all', 'Draft', 'Open', 'Approved for Sale', 'Discount Sale', 'Rejected', 'Quarantined', 'Archived'];

export const formatQualityDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const filterQualityRows = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        row.inspectionId,
        row.product,
        row.supplier,
        row.batchCode,
        row.inspectorName,
        row.warehouse,
        row.remarks
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesGrade = filters.grade === 'all' || row.grade === filters.grade;
    const matchesStatus = filters.inspectionStatus === 'all' || row.inspectionStatus === filters.inspectionStatus;
    const matchesCategory = filters.category === 'all' || row.category === filters.category;
    const matchesSupplier = filters.supplier === 'all' || row.supplier === filters.supplier;
    const matchesWarehouse = filters.warehouse === 'all' || row.warehouse === filters.warehouse;
    const matchesRegion = filters.region === 'all' || row.region === filters.region;
    const freshnessMin = filters.freshnessMin === '' ? -Infinity : Number(filters.freshnessMin);
    const freshnessMax = filters.freshnessMax === '' ? Infinity : Number(filters.freshnessMax);
    const matchesFreshness = row.freshnessScore >= freshnessMin && row.freshnessScore <= freshnessMax;
    const shelfMin = filters.shelfLifeMin === '' ? -Infinity : Number(filters.shelfLifeMin);
    const shelfMax = filters.shelfLifeMax === '' ? Infinity : Number(filters.shelfLifeMax);
    const matchesShelfLife = row.shelfLifeDays >= shelfMin && row.shelfLifeDays <= shelfMax;
    const damageThreshold = filters.damageThreshold === '' ? Infinity : Number(filters.damageThreshold);
    const matchesDamage = row.damagePercentage <= damageThreshold;
    const matchesFrom = !filters.dateFrom || new Date(row.inspectedAt) >= new Date(filters.dateFrom);
    const matchesTo = !filters.dateTo || new Date(row.inspectedAt) <= new Date(filters.dateTo);

    return matchesSearch && matchesGrade && matchesStatus && matchesCategory && matchesSupplier && matchesWarehouse && matchesRegion && matchesFreshness && matchesShelfLife && matchesDamage && matchesFrom && matchesTo;
  });

export const sortQualityRows = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'inspectedAt') return multiplier * (new Date(left.inspectedAt) - new Date(right.inspectedAt));
    if (sortBy === 'freshnessScore') return multiplier * (left.freshnessScore - right.freshnessScore);
    if (sortBy === 'shelfLifeDays') return multiplier * (left.shelfLifeDays - right.shelfLifeDays);
    if (sortBy === 'damagePercentage') return multiplier * (left.damagePercentage - right.damagePercentage);
    if (sortBy === 'product') return multiplier * left.product.localeCompare(right.product);
    if (sortBy === 'supplier') return multiplier * left.supplier.localeCompare(right.supplier);
    if (sortBy === 'grade') return multiplier * left.grade.localeCompare(right.grade);
    return multiplier * left.inspectionId.localeCompare(right.inspectionId);
  });
};

export const paginateQualityRows = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getQualityPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};

