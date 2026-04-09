export const resolveUserRoles = (user) => {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length) return [...new Set(user.roles)];
  if (user.role) return [user.role];
  return [];
};

export const normalizeActiveRole = (user) => {
  const roles = resolveUserRoles(user);
  if (user?.activeRole && roles.includes(user.activeRole)) return user.activeRole;
  if (roles.includes('buyer')) return 'buyer';
  return roles[0] || 'buyer';
};

export const userHasRole = (user, role) => resolveUserRoles(user).includes(role);

export const serializeAuthUser = (user) => {
  const roles = resolveUserRoles(user);
  const activeRole = normalizeActiveRole(user);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: activeRole,
    roles,
    activeRole,
    profileImage: user.profileImage,
    location: user.location,
    isVerified: user.isVerified
  };
};
