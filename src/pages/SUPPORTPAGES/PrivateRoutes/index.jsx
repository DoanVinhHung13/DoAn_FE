// src/pages/SUPPORTPAGES/PrivateRoutes/index.jsx
import { useContext, useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"

/**
 * PrivateRoutes — Guard cho các route cần đăng nhập (mọi role đã login).
 * Lưu URL trước khi redirect để sau login quay lại đúng trang.
 * Render Outlet với layout tương ứng (LayoutAdmin đã bao ngoài).
 */
function PrivateRoutes() {
  const { loginStore, routerBeforeStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore
  const { setRouterBeforeLogin } = routerBeforeStore
  const location = useLocation()

  // Lưu URL hiện tại trước khi redirect về trang chủ
  useEffect(() => {
    if (!isLoginContext) {
      setRouterBeforeLogin(`${location.pathname}${location.search}`)
    }
  }, [isLoginContext])

  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <Outlet />
}

export default PrivateRoutes
