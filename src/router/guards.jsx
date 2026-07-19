// src/router/guards.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import authSession from 'src/redux/authSession'
import ROUTER from './ROUTER'
import { getDashboardPathByRole } from './roleRedirects'
import { hasRoleAccess } from './authUtils'

export { hasRoleAccess } from './authUtils'

/**
 * ProtectedRoute — chỉ cho vào nếu đã đăng nhập và đúng role.
 *
 * Logic:
 *  1. Không có token → redirect /login
 *  2. Cần check role nhưng Redux chưa có user (DefaultAction đang fetch /me) → spinner
 *  3. Có user nhưng sai role → /forbidden
 *  4. Đúng hết → render
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.appGlobal.userInfo)
  const token = authSession.isAuthenticated()

  // Không có token → về login
  if (!token) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // Có token nhưng Redux chưa load xong user (DefaultAction đang fetch /me)
  // → Chỉ block khi cần check role. Nếu không cần check role → cho qua ngay.
  if (allowedRoles && !user?._id) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>Đang tải hệ thống...</span>
        </div>
      </div>
    )
  }

  // Có user, check quyền
  if (allowedRoles && user?._id && !hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }

  return children ?? <Outlet />
}

/**
 * GuestRoute — chỉ cho vào nếu chưa đăng nhập.
 * Nếu đã login thì redirect về dashboard tương ứng.
 */
const GuestRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.appGlobal)
  const isLoggedIn = authSession.isAuthenticated() || Boolean(userInfo?._id)

  if (isLoggedIn) {
    const role = userInfo?.role ?? authSession.getUser()?.role
    return <Navigate to={getDashboardPathByRole(role)} replace />
  }

  return children ?? <Outlet />
}

export { ProtectedRoute, GuestRoute }
