// src/router/guards.jsx
// 4 Role: FARM_MANAGER, LAND_MANAGER, MATERIAL_MANAGER, FARMER
// Permission definitions by role

import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import STORAGE from 'src/store/storage'
import ROUTER from './ROUTER'
import { ROLES } from 'src/constants/roles'

/**
 * Permission definitions by role
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.FARM_MANAGER]: [
    'dashboard',
    'users',
    'lands',
    'crop_catalogs',
    'crops',
    'production_plans',
    'tasks',
    'logbooks',
    'batches',
    'notifications',
    'view_fertilizers',
    'view_crop_protections',
    'view_purchase_reqs',
    'htx_journals',
    'journal_approval',
    'vietgap',
    'huuco',
    'thongminh',
    'account_info',
    'change_password',
  ],
  [ROLES.LAND_MANAGER]: [
    'dashboard',
    'farmers',
    'lands',
    'production_plans',
    'tasks',
    'logbooks',
    'batches',
    'view_catalogs',
    'account_info',
    'change_password',
  ],
  [ROLES.MATERIAL_MANAGER]: [
    'dashboard',
    'fertilizers',
    'crop_protections',
    'machinery',
    'other_materials',
    'purchase_reqs',
    'production_plans',
    'tasks',
    'account_info',
    'change_password',
  ],
  [ROLES.FARMER]: [
    'dashboard',
    'tasks',
    'logbooks',
    'plans',
    'supplies',
    'vietgap',
    'huuco',
    'thongminh',
    'account_info',
    'change_password',
  ],
  [ROLES.HTX]: [
    'dashboard',
    'journals',
    'approvals',
    'farmers',
    'products',
    'batches',
    'supplies',
    'inventory',
    'account_info',
    'change_password',
  ],
}

/**
 * Helper function to check role access
 */
export const hasRoleAccess = (userRole, allowedRoles) => {
  if (!userRole) return false
  return allowedRoles.includes(userRole) || allowedRoles.includes(ROLES.ADMIN)
}

/**
 * ProtectedRoute — chỉ cho vào nếu đã đăng nhập.
 * Hỗ trợ cả children (inline) lẫn Outlet (layout route).
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.appGlobal.userInfo)
  const token = localStorage.getItem(STORAGE.TOKEN)

  if (!token || !user?._id) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  if (allowedRoles && !hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }

  return children ?? <Outlet />
}

/**
 * GuestRoute — chỉ cho vào nếu chưa đăng nhập.
 * Nếu đã login thì redirect về dashboard.
 */
export const GuestRoute = ({ children }) => {
  const token = localStorage.getItem(STORAGE.TOKEN)
  if (token) {
    return <Navigate to={ROUTER.FM_DASHBOARD} replace />
  }
  return children ?? <Outlet />
}

/**
 * AdminRoute — chỉ cho Admin.
 */
export const AdminRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (currentUser?.role !== ROLES.ADMIN) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}

/**
 * FarmManagerRoute — chỉ cho Farm Manager.
 */
export const FarmManagerRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (!hasRoleAccess(currentUser?.role, [ROLES.FARM_MANAGER])) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}

/**
 * LandManagerRoute — chỉ cho Land Manager.
 */
export const LandManagerRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (!hasRoleAccess(currentUser?.role, [ROLES.LAND_MANAGER])) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}

/**
 * MaterialManagerRoute — chỉ cho Material Manager.
 */
export const MaterialManagerRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (!hasRoleAccess(currentUser?.role, [ROLES.MATERIAL_MANAGER])) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}

/**
 * FarmerRoute — chỉ cho Farmer.
 */
export const FarmerRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (!hasRoleAccess(currentUser?.role, [ROLES.FARMER])) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}

/**
 * RoleLayoutRoute — kiểm tra role và chọn layout phù hợp
 * Redirect về dashboard tương ứng nếu role không khớp
 */
export const RoleLayoutRoute = ({ children, targetRole }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  const userRole = currentUser?.role

  if (!userRole) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  const roleRedirectMap = {
    [ROLES.FARM_MANAGER]: ROUTER.FM_DASHBOARD,
    [ROLES.LAND_MANAGER]: ROUTER.LM_DASHBOARD,
    [ROLES.MATERIAL_MANAGER]: ROUTER.MM_DASHBOARD,
    [ROLES.FARMER]: ROUTER.FARMER_DASHBOARD,
    [ROLES.HTX]: ROUTER.HTX_JOURNALS,
    [ROLES.ADMIN]: ROUTER.ADMIN_DASHBOARD,
  }

  // Nếu user vào nhầm layout không đúng role
  if (targetRole && userRole !== targetRole && userRole !== ROLES.ADMIN) {
    const correctPath = roleRedirectMap[userRole]
    if (correctPath) {
      return <Navigate to={correctPath} replace />
    }
  }

  return children ?? <Outlet />
}
