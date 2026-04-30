export const invoiceRowsPerPage = [10, 25, 50, 100];
export const invoiceTypeOptions = ['all', 'customer', 'purchase', 'supplier', 'sales', 'return', 'credit-note'];
export const invoiceStatusOptions = ['all', 'Paid', 'Pending', 'Overdue', 'Partially Paid', 'Cancelled', 'Draft'];

export const formatInvoiceDate = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export const formatInvoiceMoney = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0));

export const filterInvoices = (rows, filters) =>
  rows.filter((row) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.invoiceId, row.linkedRecordId, row.partyName, row.partyGstin, row.status, row.invoiceOwner]
        .some((value) => String(value || '').toLowerCase().includes(query));

    const matchesType = filters.type === 'all' || row.type === filters.type;
    const matchesStatus = filters.status === 'all' || row.status === filters.status;
    const matchesPartyType = filters.partyType === 'all' || row.partyType === filters.partyType;
    const matchesPaymentMethod = filters.paymentMethod === 'all' || row.paymentMethod === filters.paymentMethod;
    const matchesIssueFrom = !filters.issueFrom || new Date(row.issueDate) >= new Date(filters.issueFrom);
    const matchesIssueTo = !filters.issueTo || new Date(row.issueDate) <= new Date(filters.issueTo);
    const matchesDueFrom = !filters.dueFrom || new Date(row.dueDate) >= new Date(filters.dueFrom);
    const matchesDueTo = !filters.dueTo || new Date(row.dueDate) <= new Date(filters.dueTo);
    const matchesOverdueOnly = !filters.overdueOnly || row.status === 'Overdue';
    const matchesUnpaidOnly = !filters.unpaidOnly || row.balanceDue > 0;
    const matchesTaxType = filters.taxType === 'all' || row.taxType === filters.taxType;
    const amountMin = filters.amountMin === '' ? -Infinity : Number(filters.amountMin);
    const amountMax = filters.amountMax === '' ? Infinity : Number(filters.amountMax);
    const matchesAmount = row.grandTotal >= amountMin && row.grandTotal <= amountMax;

    return matchesSearch && matchesType && matchesStatus && matchesPartyType && matchesPaymentMethod && matchesIssueFrom && matchesIssueTo && matchesDueFrom && matchesDueTo && matchesOverdueOnly && matchesUnpaidOnly && matchesTaxType && matchesAmount;
  });

export const sortInvoices = (rows, sortBy, direction) => {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    if (sortBy === 'issueDate') return multiplier * (new Date(left.issueDate) - new Date(right.issueDate));
    if (sortBy === 'dueDate') return multiplier * (new Date(left.dueDate) - new Date(right.dueDate));
    if (sortBy === 'totalAmount') return multiplier * (left.grandTotal - right.grandTotal);
    if (sortBy === 'balanceDue') return multiplier * (left.balanceDue - right.balanceDue);
    if (sortBy === 'status') return multiplier * left.status.localeCompare(right.status);
    if (sortBy === 'partyName') return multiplier * left.partyName.localeCompare(right.partyName);
    if (sortBy === 'type') return multiplier * left.type.localeCompare(right.type);
    return multiplier * left.invoiceId.localeCompare(right.invoiceId);
  });
};

export const paginateInvoices = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getInvoicePaginationMeta = (totalRows, currentPage, rowsPerPage) => {
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalRows === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const end = Math.min(totalRows, safePage * rowsPerPage);
  return { totalPages, safePage, start, end };
};

