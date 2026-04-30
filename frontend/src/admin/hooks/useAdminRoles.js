import { useMemo, useState } from 'react';
import { downloadCsv } from '../exportUtils.js';
import { generateAdminRoles } from '../header/generateAdminHeaderData.js';

export default function useAdminRoles(onActivity, onToast) {
  const [roles, setRoles] = useState(() => generateAdminRoles());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const selectedRole = useMemo(() => roles.find((role) => role.roleId === selectedRoleId) || null, [roles, selectedRoleId]);

  const logRoleAction = (title, roleName, type = 'info') => {
    onActivity?.({
      title,
      meta: roleName,
      time: 'Just now',
      type
    });
    onToast?.(title, `${roleName} updated successfully.`);
  };

  return {
    roles,
    isOpen,
    selectedRole,
    openDrawer: () => setIsOpen(true),
    closeDrawer: () => {
      setIsOpen(false);
      setSelectedRoleId(null);
    },
    viewRole: (roleId) => {
      setSelectedRoleId(roleId);
      setIsOpen(true);
    },
    addRole: () => {
      const role = {
        roleId: `ROLE-CUSTOM-${Date.now()}`,
        roleName: 'Custom Admin Role',
        description: 'New role created from admin header controls.',
        permissions: ['reports.read'],
        assignedUsersCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRoles((current) => [role, ...current]);
      setSelectedRoleId(role.roleId);
      setIsOpen(true);
      logRoleAction('Role added', role.roleName, 'success');
    },
    duplicateRole: (roleId) => {
      const role = roles.find((item) => item.roleId === roleId);
      if (!role) return;
      const duplicate = {
        ...role,
        roleId: `${role.roleId}-COPY`,
        roleName: `${role.roleName} Copy`,
        assignedUsersCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRoles((current) => [duplicate, ...current]);
      logRoleAction('Role duplicated', duplicate.roleName, 'success');
    },
    toggleRoleStatus: (roleId) => {
      const role = roles.find((item) => item.roleId === roleId);
      if (!role) return;
      const nextStatus = role.status === 'active' ? 'inactive' : 'active';
      setRoles((current) =>
        current.map((item) => (item.roleId === roleId ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item))
      );
      logRoleAction(nextStatus === 'active' ? 'Role activated' : 'Role deactivated', role.roleName, nextStatus === 'active' ? 'success' : 'warning');
    },
    editRole: (roleId) => {
      const role = roles.find((item) => item.roleId === roleId);
      if (!role) return;
      setRoles((current) =>
        current.map((item) => (item.roleId === roleId ? { ...item, description: `${item.description} Updated by admin.`, updatedAt: new Date().toISOString() } : item))
      );
      logRoleAction('Role edited', role.roleName, 'success');
    },
    assignUsersPlaceholder: (roleId) => {
      const role = roles.find((item) => item.roleId === roleId);
      if (!role) return;
      logRoleAction('Assign users placeholder', role.roleName, 'info');
    },
    exportRoles: () => {
      downloadCsv('admin-roles', roles);
      onToast?.('Roles exported', 'Admin roles were exported to CSV.');
    }
  };
}
