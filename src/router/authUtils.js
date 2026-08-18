/** hasRoleAccess — tách ra file riêng để tránh Vite Fast Refresh warning */
import { normalizeRole } from "src/constants/roles"

export const hasRoleAccess = (userRole, allowedRoles) => {
  if (!userRole || !allowedRoles?.length) return false
  return allowedRoles.includes(normalizeRole(userRole))
}
