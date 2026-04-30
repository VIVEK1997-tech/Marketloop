export const approvalOptions = ['all', 'Approved', 'Pending Review', 'Rejected'];
export const stockOptions = ['all', 'in_stock', 'low_stock', 'out_of_stock'];
export const qualityOptions = ['all', 'Premium', 'Fresh', 'Standard', 'Average', 'Damaged'];
export const organicOptions = ['all', 'organic', 'non_organic'];
export const lifecycleOptions = ['all', 'Draft', 'Pending Review', 'Approved', 'Rejected', 'Out of Stock', 'Archived', 'Discontinued'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
export const formatAdminDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const filterProducts = (products, filters) =>
  products.filter((product) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [product.productName, product.category, product.vendorName, product.sku].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );
    const matchesApproval = filters.approval === 'all' || product.approvalStatus === filters.approval;
    const matchesStock =
      filters.stock === 'all' ||
      (filters.stock === 'in_stock' && product.stock > 20) ||
      (filters.stock === 'low_stock' && product.stock > 0 && product.stock <= 20) ||
      (filters.stock === 'out_of_stock' && product.stock === 0);
    const matchesOrganic =
      filters.organic === 'all' ||
      (filters.organic === 'organic' ? product.organic : !product.organic);
    const matchesQuality = filters.quality === 'all' || product.quality === filters.quality;
    const matchesCategory = filters.category === 'all' || product.category === filters.category;
    const matchesVendor = filters.vendor === 'all' || product.vendorName === filters.vendor;
    const matchesLifecycle = filters.lifecycle === 'all' || product.lifecycleStatus === filters.lifecycle;

    return matchesSearch && matchesApproval && matchesStock && matchesOrganic && matchesQuality && matchesCategory && matchesVendor && matchesLifecycle;
  });

export const sortProducts = (products, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...products].sort((left, right) => {
    const leftValue =
      sortBy === 'price' ? left.price :
      sortBy === 'stock' ? left.stock :
      sortBy === 'health' ? left.healthScore :
      sortBy === 'updated' ? new Date(left.updatedAt).getTime() :
      sortBy === 'approval' ? left.approvalStatus :
      left.productName.toLowerCase();
    const rightValue =
      sortBy === 'price' ? right.price :
      sortBy === 'stock' ? right.stock :
      sortBy === 'health' ? right.healthScore :
      sortBy === 'updated' ? new Date(right.updatedAt).getTime() :
      sortBy === 'approval' ? right.approvalStatus :
      right.productName.toLowerCase();
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
