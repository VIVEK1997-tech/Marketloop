export const getRoleLabel = (role = 'buyer') => {
  if (role === 'admin') return 'Admin';
  return role === 'seller' ? 'Seller' : 'Buyer';
};

export const getPostLoginRoute = (user, preferredRole) => {
  const roles = Array.isArray(user?.roles) && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const activeRole = preferredRole || user?.activeRole || user?.role || (roles.includes('buyer') ? 'buyer' : roles[0]);

  if (roles.includes('admin') && activeRole === 'admin') return '/admin';
  if (activeRole === 'seller') return '/dashboard';
  return '/';
};
