export const paymentStatusOptions = ['all', 'Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded', 'COD Pending', 'Chargeback'];
export const deliveryStatusOptions = ['all', 'Pending', 'Assigned', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed Attempt', 'Returned', 'Cancelled'];
export const orderStatusOptions = ['all', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed', 'Returned', 'Refunded', 'Partially Refunded', 'On Hold', 'Disputed'];
export const refundStatusOptions = ['all', 'None', 'Refunded', 'Partially Refunded'];
export const disputeStatusOptions = ['all', 'None', 'Open', 'Resolved'];
export const riskOptions = ['all', 'low_risk', 'medium_risk', 'high_risk'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const filterOrders = (orders, filters) =>
  orders.filter((order) => {
    const query = filters.search.trim().toLowerCase();
    const amount = order.amount;
    const matchesSearch =
      !query ||
      [order.orderId, order.buyerId, order.buyerName, order.sellerId, order.sellerName, order.productList, order.trackingId, order.transactionId].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );
    const orderDate = new Date(order.orderDate).getTime();
    const dateFrom = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
    const dateTo = filters.dateTo ? new Date(filters.dateTo).getTime() : null;

    return (
      matchesSearch &&
      (filters.paymentStatus === 'all' || order.paymentStatus === filters.paymentStatus) &&
      (filters.deliveryStatus === 'all' || order.deliveryStatus === filters.deliveryStatus) &&
      (filters.orderStatus === 'all' || order.orderStatus === filters.orderStatus) &&
      (filters.refundStatus === 'all' || order.refundStatus === filters.refundStatus) &&
      (filters.disputeStatus === 'all' || order.disputeStatus === filters.disputeStatus) &&
      (filters.suspicious === 'all' || (filters.suspicious === 'flagged' ? order.suspicious : !order.suspicious)) &&
      (filters.risk === 'all' || order.riskFlag === filters.risk) &&
      (!filters.amountMin || amount >= Number(filters.amountMin)) &&
      (!filters.amountMax || amount <= Number(filters.amountMax)) &&
      (!filters.seller || order.sellerName.toLowerCase().includes(filters.seller.toLowerCase())) &&
      (!filters.buyer || order.buyerName.toLowerCase().includes(filters.buyer.toLowerCase())) &&
      (!dateFrom || orderDate >= dateFrom) &&
      (!dateTo || orderDate <= dateTo)
    );
  });

export const sortOrders = (orders, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...orders].sort((left, right) => {
    const leftValue =
      sortBy === 'oldest' || sortBy === 'newest' ? new Date(left.orderDate).getTime() :
      sortBy === 'amount' ? left.amount :
      sortBy === 'status' ? left.orderStatus :
      sortBy === 'payment' ? left.paymentStatus :
      sortBy === 'delivery' ? left.deliveryStatus :
      sortBy === 'buyer' ? left.buyerName.toLowerCase() :
      sortBy === 'seller' ? left.sellerName.toLowerCase() :
      new Date(left.orderDate).getTime();
    const rightValue =
      sortBy === 'oldest' || sortBy === 'newest' ? new Date(right.orderDate).getTime() :
      sortBy === 'amount' ? right.amount :
      sortBy === 'status' ? right.orderStatus :
      sortBy === 'payment' ? right.paymentStatus :
      sortBy === 'delivery' ? right.deliveryStatus :
      sortBy === 'buyer' ? right.buyerName.toLowerCase() :
      sortBy === 'seller' ? right.sellerName.toLowerCase() :
      new Date(right.orderDate).getTime();

    const localModifier = sortBy === 'oldest' ? -1 : modifier;
    if (leftValue < rightValue) return -1 * localModifier;
    if (leftValue > rightValue) return 1 * localModifier;
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
