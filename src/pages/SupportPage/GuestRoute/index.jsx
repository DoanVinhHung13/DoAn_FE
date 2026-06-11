// src/pages/SupportPage/GuestRoute/index.jsx
// Guard cho các route chỉ dành cho khách (chưa login).
// Nguồn dữ liệu: authSession (token) + Redux (userInfo).
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import authSession from 'src/store/authSession'
import ROUTER from 'src/router/ROUTER'

/**
 * GuestRoute — Chỉ cho vào nếu CHƯA đăng nhập.
 * Nếu đã login → redirect về dashboard.
 */
function GuestRoute({ children }) {
  const { userInfo } = useSelector((state) => state.appGlobal)
  const isLoggedIn = authSession.isAuthenticated() || Boolean(userInfo?._id)

  if (isLoggedIn) {
    return <Navigate to={ROUTER.FM_DASHBOARD} replace />
  }

  return children ?? <Outlet />
}

export default GuestRoute
