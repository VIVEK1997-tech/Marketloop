export const statusOptions = ['all', 'successful', 'pending', 'failed', 'refunded', 'partially_refunded', 'disputed', 'chargeback', 'settlement_pending', 'gateway_timeout'];
export const methodOptions = ['all', 'UPI', 'Card', 'Net Banking', 'Wallet', 'COD', 'PayPal', 'Stripe'];
export const refundOptions = ['all', 'none', 'requested', 'approved', 'rejected', 'partial', 'completed'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

export const filterTransactions = (transactions, filters) =>
  transactions.filter((transaction) => {
    const query = filters.search.trim().toLowerCase();
    const createdAt = new Date(transaction.createdAt).getTime();
    const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
    const to = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
    const matchesSearch =
      !query ||
      [transaction.id, transaction.buyerName, transaction.sellerName, transaction.orderId, transaction.paymentReference].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );

    return (
      matchesSearch &&
      (filters.status === 'all' || transaction.status === filters.status) &&
      (filters.method === 'all' || transaction.method === filters.method) &&
      (filters.refundStatus === 'all' || transaction.refundStatus === filters.refundStatus) &&
      (!filters.amountMin || transaction.amount >= Number(filters.amountMin)) &&
      (!filters.amountMax || transaction.amount <= Number(filters.amountMax)) &&
      (!from || createdAt >= from) &&
      (!to || createdAt <= to)
    );
  });

export const sortTransactions = (transactions, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...transactions].sort((left, right) => {
    const leftValue =
      sortBy === 'amount' ? left.amount :
      sortBy === 'date' ? new Date(left.createdAt).getTime() :
      sortBy === 'status' ? left.status :
      sortBy === 'buyer' ? left.buyerName.toLowerCase() :
      sortBy === 'seller' ? left.sellerName.toLowerCase() :
      new Date(left.createdAt).getTime();
    const rightValue =
      sortBy === 'amount' ? right.amount :
      sortBy === 'date' ? new Date(right.createdAt).getTime() :
      sortBy === 'status' ? right.status :
      sortBy === 'buyer' ? right.buyerName.toLowerCase() :
      sortBy === 'seller' ? right.sellerName.toLowerCase() :
      new Date(right.createdAt).getTime();

    if (leftValue < rightValue) return -1 * modifier;
    if (leftValue > rightValue) return 1 * modifier;
    return 0;
  });
};

export const paginateRows = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getPaginationMeta = (totalRows, currentPage, rowsPerPage) => ({
  start: totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1,
  end: Math.min(currentPage * rowsPerPage, totalRows),
  totalPages: Math.max(1, Math.ceil(totalRows / rowsPerPage))
});
