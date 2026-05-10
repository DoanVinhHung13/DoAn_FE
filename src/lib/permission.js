import { ROLE_PERMISSIONS } from "src/constants/permissions"
import { DEFAULT_ROLE } from "src/constants/roles"

export const hasRolePermission = (role = DEFAULT_ROLE, permission) => {
  if (!permission) return false
  const rolePermissions = ROLE_PERMISSIONS[role] || []
  return rolePermissions.includes(permission)
}

export const canAccessAnyPermission = (role = DEFAULT_ROLE, permissions = []) =>
  permissions.some(permission => hasRolePermission(role, permission))
