import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import STORAGE from 'src/lib/storage'
import ROUTER from './ROUTER'

/**
 * ProtectedRoute — chỉ cho vào nếu đã đăng nhập.
 * Hỗ trợ cả children (inline) lẫn Outlet (layout route).
 */
export const ProtectedRoute = ({ children, requireAdmin, farmerOnly }) => {
  const user = useSelector((state) => state.appGlobal.userInfo)
  const token = localStorage.getItem(STORAGE.TOKEN)

  if (!token || !user?._id) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  const currentUser = user

  // Admin cố tình vào trang Farmer-only → hiện 403
  if (farmerOnly && currentUser?.role === 'Admin') {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }

  // Farmer/HTX cố vào trang Admin-only → hiện 403
  if (requireAdmin && currentUser?.role !== 'Admin') {
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
    return <Navigate to={ROUTER.ADMIN_DASHBOARD} replace />
  }
  return children ?? <Outlet />
}

/**
 * AdminRoute — chỉ cho Admin.
 */
export const AdminRoute = ({ children }) => {
  const currentUser = useSelector((state) => state.appGlobal.userInfo)
  if (currentUser?.role !== 'Admin') {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }
  return children ?? <Outlet />
}
