export const sellerStatusTabs = ['all', 'active', 'deactivated', 'kyc_pending', 'inactive'];
export const verificationOptions = ['all', 'verified', 'pending', 'rejected'];
export const ratingOptions = ['all', '4_plus', '3_plus', 'under_3'];
export const revenueOptions = ['all', 'under_1l', '1l_to_5l', 'above_5l'];
export const productOptions = ['all', 'under_25', '25_to_100', 'above_100'];
export const riskOptions = ['all', 'low_risk', 'medium_risk', 'high_risk'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

export const filterSellers = (sellers, filters) =>
  sellers.filter((seller) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [seller.id, seller.storeName, seller.email, seller.location, seller.city].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );
    const matchesStatus = filters.status === 'all' || seller.status === filters.status;
    const matchesVerification = filters.verification === 'all' || seller.verificationStatus === filters.verification;
    const matchesRating =
      filters.rating === 'all' ||
      (filters.rating === '4_plus' && seller.rating >= 4) ||
      (filters.rating === '3_plus' && seller.rating >= 3) ||
      (filters.rating === 'under_3' && seller.rating < 3);
    const matchesRevenue =
      filters.revenue === 'all' ||
      (filters.revenue === 'under_1l' && seller.revenue < 100000) ||
      (filters.revenue === '1l_to_5l' && seller.revenue >= 100000 && seller.revenue <= 500000) ||
      (filters.revenue === 'above_5l' && seller.revenue > 500000);
    const matchesProducts =
      filters.products === 'all' ||
      (filters.products === 'under_25' && seller.productCount < 25) ||
      (filters.products === '25_to_100' && seller.productCount >= 25 && seller.productCount <= 100) ||
      (filters.products === 'above_100' && seller.productCount > 100);
    const matchesCity = filters.city === 'all' || seller.city === filters.city;
    const matchesRisk = filters.risk === 'all' || seller.riskBand === filters.risk;

    return matchesSearch && matchesStatus && matchesVerification && matchesRating && matchesRevenue && matchesProducts && matchesCity && matchesRisk;
  });

export const sortSellers = (sellers, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...sellers].sort((left, right) => {
    const leftValue =
      sortBy === 'revenue' ? left.revenue :
      sortBy === 'rating' ? left.rating :
      sortBy === 'newest' ? new Date(left.createdAt).getTime() :
      sortBy === 'products' ? left.productCount :
      sortBy === 'status' ? String(left.status) :
      String(left.storeName).toLowerCase();
    const rightValue =
      sortBy === 'revenue' ? right.revenue :
      sortBy === 'rating' ? right.rating :
      sortBy === 'newest' ? new Date(right.createdAt).getTime() :
      sortBy === 'products' ? right.productCount :
      sortBy === 'status' ? String(right.status) :
      String(right.storeName).toLowerCase();

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
