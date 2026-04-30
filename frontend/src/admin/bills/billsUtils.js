export const billRowsPerPage = [10, 25, 50, 100];
export const billStatusOptions = ['all', 'Draft', 'Pending', 'Partially Paid', 'Paid', 'Overdue', 'Failed', 'Cancelled'];
export const billModeOptions = ['all', 'UPI', 'Bank Transfer', 'Wallet', 'Card', 'Cash', 'Cheque', 'Manual'];

export const formatBillMoney = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));

export const formatBillDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const filterBills = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [
        row.billId,
        row.linkedInvoiceId,
        row.linkedPurchaseOrderId,
        row.supplierName,
        row.supplierGstin,
        row.paymentReference,
        row.assignedAdmin
      ].some((value) => String(value || '').toLowerCase().includes(query));

    const matchesStatus = filters.status === 'all' || row.status === filters.status;
    const matchesMode = filters.paymentMode === 'all' || row.paymentMode === filters.paymentMode;
    const matchesSupplier = filters.supplier === 'all' || row.supplierName === filters.supplier;
    const matchesPriority = filters.priority === 'all' || row.priority === filters.priority;
    const matchesBillFrom = !filters.billFrom || new Date(row.billDate) >= new Date(filters.billFrom);
    const matchesBillTo = !filters.billTo || new Date(row.billDate) <= new Date(filters.billTo);
    const matchesDueFrom = !filters.dueFrom || new Date(row.dueDate) >= new Date(filters.dueFrom);
    const matchesDueTo = !filters.dueTo || new Date(row.dueDate) <= new Date(filters.dueTo);
    const matchesOverdue = !filters.overdueOnly || row.status === 'Overdue';
    const matchesUnpaid = !filters.unpaidOnly || row.balanceDue > 0;
    const amountMin = filters.amountMin === '' ? -Infinity : Number(filters.amountMin);
    const amountMax = filters.amountMax === '' ? Infinity : Number(filters.amountMax);
    const taxMin = filters.taxMin === '' ? -Infinity : Number(filters.taxMin);
    const taxMax = filters.taxMax === '' ? Infinity : Number(filters.taxMax);
    const matchesAmount = row.grandTotal >= amountMin && row.grandTotal <= amountMax;
    const matchesTax = row.taxAmount >= taxMin && row.taxAmount <= taxMax;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMode &&
      matchesSupplier &&
      matchesPriority &&
      matchesBillFrom &&
      matchesBillTo &&
      matchesDueFrom &&
      matchesDueTo &&
      matchesOverdue &&
      matchesUnpaid &&
      matchesAmount &&
      matchesTax
    );
  });

export const sortBills = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    if (sortBy === 'dueDate') return multiplier * (new Date(left.dueDate) - new Date(right.dueDate));
    if (sortBy === 'billDate') return multiplier * (new Date(left.billDate) - new Date(right.billDate));
    if (sortBy === 'amount') return multiplier * (left.grandTotal - right.grandTotal);
    if (sortBy === 'balanceDue') return multiplier * (left.balanceDue - right.balanceDue);
    if (sortBy === 'supplierName') return multiplier * left.supplierName.localeCompare(right.supplierName);
    if (sortBy === 'paymentMode') return multiplier * left.paymentMode.localeCompare(right.paymentMode);
    if (sortBy === 'status') return multiplier * left.status.localeCompare(right.status);
    if (sortBy === 'priority') return multiplier * left.priority.localeCompare(right.priority);
    return multiplier * left.billId.localeCompare(right.billId);
  });
};

export const paginateBills = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getBillsPaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};
