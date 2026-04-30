import { Copy, Pencil, Plus, Users, X } from 'lucide-react';
import { formatSafetyDate } from '../safety/safetyUtils.js';

export default function AdminRolesDrawer({
  open,
  roles,
  selectedRole,
  onClose,
  onViewRole,
  onAddRole,
  onEditRole,
  onDuplicateRole,
  onToggleStatus,
  onAssignUsers,
  onExportRoles
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Admin Roles</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">Role permissions and ownership</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review access scopes, assigned admins, and export role definitions.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onAddRole} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              <Plus size={16} />
              Add role
            </button>
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.roleId}
                type="button"
                onClick={() => onViewRole(role.roleId)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedRole?.roleId === role.roleId ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/20' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{role.roleName}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{role.roleId}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${role.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                    {role.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>{role.assignedUsersCount} assigned users</span>
                  <span>{role.permissions.length} permissions</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            {selectedRole ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">{selectedRole.roleName}</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedRole.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${selectedRole.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                    {selectedRole.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Role ID:</span> {selectedRole.roleId}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Assigned users:</span> {selectedRole.assignedUsersCount}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Created:</span> {formatSafetyDate(selectedRole.createdAt)}</p>
                  <p><span className="font-semibold text-slate-900 dark:text-slate-100">Updated:</span> {formatSafetyDate(selectedRole.updatedAt)}</p>
                </div>
                <div className="mt-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Permissions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRole.permissions.map((permission) => (
                      <span key={permission} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEditRole(selectedRole.roleId)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                    <Pencil size={15} />
                    Edit role
                  </button>
                  <button type="button" onClick={() => onDuplicateRole(selectedRole.roleId)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                    <Copy size={15} />
                    Duplicate
                  </button>
                  <button type="button" onClick={() => onToggleStatus(selectedRole.roleId)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-900/50 dark:text-amber-300">
                    {selectedRole.status === 'active' ? 'Deactivate role' : 'Activate role'}
                  </button>
                  <button type="button" onClick={() => onAssignUsers(selectedRole.roleId)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-900/50 dark:text-emerald-300">
                    <Users size={15} />
                    Assign users
                  </button>
                  <button type="button" onClick={onExportRoles} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                    Export roles
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Select a role to inspect permissions and role actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
