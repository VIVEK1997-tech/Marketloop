export const stateOptions = ['all', 'Online', 'Offline', 'Suspended', 'Locked', 'Idle'];
export const roleOptions = ['all', 'Buyer', 'Seller', 'Admin', 'Support'];
export const sessionTypeOptions = ['all', 'Web', 'Android', 'iOS'];
export const kycOptions = ['all', 'Verified', 'Pending', 'Rejected', 'Not Required'];
export const watchlistOptions = ['all', 'watchlisted', 'not_watchlisted'];
export const suspiciousOptions = ['all', 'suspicious', 'normal'];
export const riskOptions = ['all', 'low_risk', 'medium_risk', 'high_risk'];
export const rowsPerPageOptions = [10, 25, 50, 100];

export const formatAdminDate = (value, includeTime = false) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', includeTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};

export const filterActiveUsers = (users, filters) =>
  users.filter((user) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [user.id, user.name, user.email, user.phone, user.device, user.ip].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );

    return (
      matchesSearch &&
      (filters.role === 'all' || user.role === filters.role) &&
      (filters.state === 'all' || user.state === filters.state) &&
      (filters.sessionType === 'all' || user.platform === filters.sessionType) &&
      (filters.device === 'all' || user.device.toLowerCase().includes(filters.device.toLowerCase())) &&
      (filters.kyc === 'all' || user.kycStatus === filters.kyc) &&
      (filters.watchlist === 'all' || (filters.watchlist === 'watchlisted' ? user.watchlisted : !user.watchlisted)) &&
      (filters.suspicious === 'all' || (filters.suspicious === 'suspicious' ? user.suspicious : !user.suspicious)) &&
      (filters.online === 'all' || (filters.online === 'online' ? user.state === 'Online' : user.state !== 'Online')) &&
      (filters.risk === 'all' || user.riskBand === filters.risk)
    );
  });

export const sortActiveUsers = (users, sortBy, direction) => {
  const modifier = direction === 'asc' ? 1 : -1;
  return [...users].sort((left, right) => {
    const leftValue =
      sortBy === 'lastSeen' ? new Date(left.lastSeen).getTime() :
      sortBy === 'loginTime' ? new Date(left.loginTime).getTime() :
      sortBy === 'role' ? left.role :
      sortBy === 'status' ? left.state :
      sortBy === 'sessionCount' ? left.sessionCount :
      left.name.toLowerCase();
    const rightValue =
      sortBy === 'lastSeen' ? new Date(right.lastSeen).getTime() :
      sortBy === 'loginTime' ? new Date(right.loginTime).getTime() :
      sortBy === 'role' ? right.role :
      sortBy === 'status' ? right.state :
      sortBy === 'sessionCount' ? right.sessionCount :
      right.name.toLowerCase();

    if (leftValue < rightValue) return -1 * modifier;
    if (leftValue > rightValue) return 1 * modifier;
    return 0;
  });
};

export const filterAuditLogs = (logs, filters) =>
  logs.filter((log) => {
    const query = filters.auditSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [log.entity, log.entityId, log.field, log.updatedBy, log.oldValue, log.newValue].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );
    const from = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
    const to = filters.dateTo ? new Date(filters.dateTo).getTime() : null;
    const logTime = new Date(log.updatedAt).getTime();

    return (
      matchesSearch &&
      (filters.entityType === 'all' || log.entityType === filters.entityType) &&
      (filters.fieldName === 'all' || log.field === filters.fieldName) &&
      (filters.updaterType === 'all' || log.updaterType === filters.updaterType) &&
      (!from || logTime >= from) &&
      (!to || logTime <= to)
    );
  });

export const paginateRows = (rows, currentPage, rowsPerPage) => {
  const startIndex = (currentPage - 1) * rowsPerPage;
  return rows.slice(startIndex, startIndex + rowsPerPage);
};

export const getPaginationMeta = (totalRows, currentPage, rowsPerPage) => ({
  start: totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1,
  end: Math.min(currentPage * rowsPerPage, totalRows),
  totalPages: Math.max(1, Math.ceil(totalRows / rowsPerPage))
});
