// src/router/guards.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import authSession from 'src/redux/authSession'
import ROUTER from './ROUTER'
import { normalizeRole } from 'src/constants/roles'
import { getDashboardPathByRole } from './roleRedirects'

/**
 * Helper function to check role access
 */
export const hasRoleAccess = (userRole, allowedRoles) => {
  if (!userRole) return false
  return allowedRoles.includes(normalizeRole(userRole))
}

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.appGlobal.userInfo)
  const token = authSession.isAuthenticated()

  if (!token) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // Chờ load user info từ DefaultAction
  if (!user?._id) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>Đang tải hệ thống...</span>
        </div>
      </div>
    )
  }

  if (allowedRoles && !hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }

  return children ?? <Outlet />
}

/**
 * GuestRoute — chỉ cho vào nếu chưa đăng nhập.
 * Nếu đã login thì redirect về dashboard tương ứng.
 */
export const GuestRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.appGlobal)
  const isLoggedIn = authSession.isAuthenticated() || Boolean(userInfo?._id)

  if (isLoggedIn) {
    const role = userInfo?.role ?? authSession.getUser()?.role
    return <Navigate to={getDashboardPathByRole(role)} replace />
  }

  return children ?? <Outlet />
}
