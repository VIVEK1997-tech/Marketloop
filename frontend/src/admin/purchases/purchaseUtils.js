export const rowsPerPageOptions = [10, 25, 50, 100];

export const purchaseStatusOptions = ['all', 'Draft', 'Pending Approval', 'Ordered', 'Partially Received', 'Received', 'Quality Check', 'Rejected', 'Cancelled', 'Closed'];
export const paymentStatusOptions = ['all', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Invoice Missing', 'Payment Scheduled'];
export const deliveryStatusOptions = ['all', 'Pending', 'In Transit', 'Partially Received', 'Delivered', 'Cancelled'];

export const formatMoney = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const filterPurchases = (rows, filters) =>
  rows.filter((purchase) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        purchase.purchaseId,
        purchase.supplierName,
        purchase.productName,
        purchase.invoiceNumber
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesStatus = filters.purchaseStatus === 'all' || purchase.purchaseStatus === filters.purchaseStatus;
    const matchesPayment = filters.paymentStatus === 'all' || purchase.paymentStatus === filters.paymentStatus;
    const matchesSupplier = filters.supplier === 'all' || purchase.supplierName === filters.supplier;
    const matchesDelivery = filters.deliveryStatus === 'all' || purchase.deliveryStatus === filters.deliveryStatus;
    const matchesMin = !filters.costMin || purchase.totalCost >= Number(filters.costMin);
    const matchesMax = !filters.costMax || purchase.totalCost <= Number(filters.costMax);
    const matchesFrom = !filters.dateFrom || new Date(purchase.createdAt) >= new Date(filters.dateFrom);
    const matchesTo = !filters.dateTo || new Date(purchase.createdAt) <= new Date(filters.dateTo);

    return matchesSearch && matchesStatus && matchesPayment && matchesSupplier && matchesDelivery && matchesMin && matchesMax && matchesFrom && matchesTo;
  });

export const sortPurchases = (rows, sortBy, direction) => {
  const sorted = [...rows].sort((left, right) => {
    const multiplier = direction === 'asc' ? 1 : -1;
    if (sortBy === 'supplier') return multiplier * left.supplierName.localeCompare(right.supplierName);
    if (sortBy === 'totalCost') return multiplier * (left.totalCost - right.totalCost);
    if (sortBy === 'status') return multiplier * left.purchaseStatus.localeCompare(right.purchaseStatus);
    if (sortBy === 'paymentStatus') return multiplier * left.paymentStatus.localeCompare(right.paymentStatus);
    return multiplier * (new Date(left.updatedAt) - new Date(right.updatedAt));
  });
  return sorted;
};

export const paginateRows = (rows, currentPage, rowsPerPage) => {
  const start = (currentPage - 1) * rowsPerPage;
  return rows.slice(start, start + rowsPerPage);
};

export const getPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, start, end, safePage };
};

