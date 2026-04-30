export const buyerStatusOptions = ['all', 'active', 'inactive', 'blocked', 'pending'];
export const verificationOptions = ['all', 'verified', 'unverified'];
export const segmentOptions = ['all', 'New', 'Loyal', 'At Risk', 'Dormant'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const getBuyerHealthTone = (health) =>
  health === 'critical' ? 'text-rose-700 bg-rose-50 border-rose-200' :
  health === 'watch' ? 'text-amber-700 bg-amber-50 border-amber-200' :
  'text-emerald-700 bg-emerald-50 border-emerald-200';

export const filterBuyers = (buyers, filters) =>
  buyers.filter((buyer) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [buyer.name, buyer.email, buyer.phone, buyer.location, buyer.city, buyer.state].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );

    return (
      matchesSearch &&
      (filters.status === 'all' || buyer.status === filters.status) &&
      (filters.city === 'all' || buyer.city === filters.city) &&
      (filters.verification === 'all' || (filters.verification === 'verified' ? buyer.isVerified : !buyer.isVerified)) &&
      (!filters.vipOnly || buyer.isVip) &&
      (!filters.highSpendersOnly || buyer.totalSpent >= 75000) &&
      (!filters.wishlistOnly || buyer.wishlistCount > 0) &&
      (filters.segment === 'all' || buyer.segment === filters.segment)
    );
  });

export const sortBuyers = (buyers, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...buyers].sort((left, right) => {
    const leftValue =
      sortBy === 'orders' ? left.totalOrders :
      sortBy === 'spent' ? left.totalSpent :
      sortBy === 'wishlist' ? left.wishlistCount :
      sortBy === 'joinDate' ? new Date(left.joinDate).getTime() :
      sortBy === 'lastActivity' ? new Date(left.lastActivity).getTime() :
      String(left.name).toLowerCase();
    const rightValue =
      sortBy === 'orders' ? right.totalOrders :
      sortBy === 'spent' ? right.totalSpent :
      sortBy === 'wishlist' ? right.wishlistCount :
      sortBy === 'joinDate' ? new Date(right.joinDate).getTime() :
      sortBy === 'lastActivity' ? new Date(right.lastActivity).getTime() :
      String(right.name).toLowerCase();

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
