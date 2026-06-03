// src/pages/SUPPORTPAGES/AdminRouter/index.jsx
import { useContext, useEffect } from "react"
import { useSelector } from "react-redux"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"

/**
 * AdminRoutes — Guard kiểm tra đã đăng nhập.
 * Chỉ cho vào nếu đã đăng nhập (isLoginContext = true).
 */
function AdminRoutes() {
  const { loginStore, routerBeforeStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore
  const { setRouterBeforeLogin } = routerBeforeStore
  const location = useLocation()

  // Lưu URL trước khi redirect
  useEffect(() => {
    if (!isLoginContext) {
      setRouterBeforeLogin(`${location.pathname}${location.search}`)
    }
  }, [isLoginContext])

  // Chưa đăng nhập → về login
  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <Outlet />
}

export default AdminRoutes
