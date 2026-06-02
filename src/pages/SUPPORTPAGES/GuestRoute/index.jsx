// src/pages/SUPPORTPAGES/GuestRoute/index.jsx
import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"

/**
 * GuestRoute — Chỉ cho vào nếu CHƯA đăng nhập.
 * Nếu đã login → redirect về dashboard.
 */
function GuestRoute({ children }) {
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore

  if (isLoginContext) {
    return <Navigate to={ROUTER.ADMIN_DASHBOARD} replace />
  }

  return children ?? <Outlet />
}

export default GuestRoute
