// src/pages/SupportPage/PrivateRoutes/index.jsx
// Guard cho các route cần đăng nhập.
// Nguồn dữ liệu: Redux (userInfo) + authSession (token trong Storage).
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useContext } from 'react'
import { StoreContext } from 'src/contexts'
import authSession from 'src/store/authSession'
import ROUTER from 'src/router/ROUTER'

/**
 * PrivateRoutes — Chỉ cho vào nếu đã đăng nhập.
 *
 * Logic kiểm tra (theo thứ tự ưu tiên):
 *  1. authSession.isAuthenticated() — đọc token từ Storage (tin cậy sau reload)
 *  2. userInfo._id từ Redux — đảm bảo user đã được load
 *
 * Khi DefaultAction đang fetch /me (token có nhưng Redux chưa có user):
 *  → Cho vào (token đủ để tin là đã login), DefaultAction sẽ populate Redux ngay sau.
 */
function PrivateRoutes() {
  const { userInfo } = useSelector((state) => state.appGlobal)
  const { routerBeforeStore } = useContext(StoreContext)
  const { setRouterBeforeLogin } = routerBeforeStore
  const location = useLocation()

  const hasToken   = authSession.isAuthenticated()
  const hasUser    = Boolean(userInfo?._id)
  const isLoggedIn = hasToken || hasUser

  // Lưu URL hiện tại trước khi redirect (để sau login quay lại đúng trang)
  useEffect(() => {
    if (!isLoggedIn) {
      setRouterBeforeLogin(`${location.pathname}${location.search}`)
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <Outlet />
}

export default PrivateRoutes
