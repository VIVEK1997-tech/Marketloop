export const inventoryRowsPerPage = [10, 25, 50, 100];
export const freshnessOptions = ['all', 'Green', 'Orange', 'Red'];

export const formatInventoryDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const formatMoney = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export const filterInventoryBatches = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.sku, row.product, row.warehouse, row.supplier, row.batchCode, row.freshnessGrade, row.adminNotes]
        .some((value) => String(value || '').toLowerCase().includes(query));

    const matchesFreshness = filters.freshness === 'all' || row.freshnessGrade === filters.freshness;
    const matchesWarehouse = filters.warehouse === 'all' || row.warehouse === filters.warehouse;
    const matchesCategory = filters.category === 'all' || row.category === filters.category;
    const matchesSupplier = filters.supplier === 'all' || row.supplier === filters.supplier;
    const matchesBuyerStatus = filters.buyerStatus === 'all' || row.buyerStatus === filters.buyerStatus;
    const matchesSellerStatus = filters.sellerStatus === 'all' || row.sellerStatus === filters.sellerStatus;
    const matchesExpiryFrom = !filters.expiryFrom || new Date(row.expiryDate) >= new Date(filters.expiryFrom);
    const matchesExpiryTo = !filters.expiryTo || new Date(row.expiryDate) <= new Date(filters.expiryTo);
    const matchesLowStock = !filters.lowStockOnly || row.availableQty <= row.reorderLevel;
    const matchesDamaged = !filters.damagedOnly || row.damagedQty > 0;
    const matchesNearExpiry = !filters.nearExpiryOnly || ((new Date(row.expiryDate).getTime() - Date.now()) / 86400000 <= 3);
    const availableMin = filters.availableMin === '' ? -Infinity : Number(filters.availableMin);
    const availableMax = filters.availableMax === '' ? Infinity : Number(filters.availableMax);
    const matchesAvailable = row.availableQty >= availableMin && row.availableQty <= availableMax;
    const marginMin = filters.marginMin === '' ? -Infinity : Number(filters.marginMin);
    const marginMax = filters.marginMax === '' ? Infinity : Number(filters.marginMax);
    const matchesMargin = row.margin >= marginMin && row.margin <= marginMax;

    return matchesSearch && matchesFreshness && matchesWarehouse && matchesCategory && matchesSupplier && matchesBuyerStatus && matchesSellerStatus && matchesExpiryFrom && matchesExpiryTo && matchesLowStock && matchesDamaged && matchesNearExpiry && matchesAvailable && matchesMargin;
  });

export const sortInventoryBatches = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'expiryDate') return multiplier * (new Date(left.expiryDate) - new Date(right.expiryDate));
    if (sortBy === 'availableQty') return multiplier * (left.availableQty - right.availableQty);
    if (sortBy === 'incomingQty') return multiplier * (left.incomingQty - right.incomingQty);
    if (sortBy === 'damagedQty') return multiplier * (left.damagedQty - right.damagedQty);
    if (sortBy === 'sellingPrice') return multiplier * (left.sellingPrice - right.sellingPrice);
    if (sortBy === 'margin') return multiplier * (left.margin - right.margin);
    if (sortBy === 'lastUpdated') return multiplier * (new Date(left.lastUpdated) - new Date(right.lastUpdated));
    if (sortBy === 'freshnessGrade') return multiplier * left.freshnessGrade.localeCompare(right.freshnessGrade);
    return multiplier * left.sku.localeCompare(right.sku);
  });
};

export const filterMovementRows = (rows, search) => {
  const query = search.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) =>
    [row.movementId, row.type, row.item, row.sku, row.location, row.referenceId, row.notes]
      .some((value) => String(value || '').toLowerCase().includes(query))
  );
};

export const paginateRows = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};

