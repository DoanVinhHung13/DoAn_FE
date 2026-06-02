// src/pages/SUPPORTPAGES/AdminRouter/index.jsx
import { useContext, useEffect, useLayoutEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { hasPermission } from "src/lib/utils"
import { MenuItemAdmin } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"

/**
 * AdminRoutes — Guard ADMIN với phân quyền TabID.
 * Chỉ cho vào nếu đã đăng nhập VÀ có ít nhất 1 tab Admin được phép.
 * Filter menu theo listTabs từ Redux.
 */
function AdminRoutes() {
  const { loginStore, routerBeforeStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore
  const { setRouterBeforeLogin } = routerBeforeStore
  const { listTabs, userInfo } = useSelector((state) => state.appGlobal)
  const [menuAdmin, setMenuAdmin] = useState([])
  const location = useLocation()

  // Đệ quy filter menu theo TabID quyền
  const filterMenuByPermission = (list) => {
    if (!list?.length) return undefined
    return list
      .filter((x) => hasPermission(x?.TabID, listTabs))
      .map((i) => ({ ...i, children: filterMenuByPermission(i?.children) }))
  }

  // Lưu URL trước khi redirect
  useEffect(() => {
    if (!isLoginContext) {
      setRouterBeforeLogin(`${location.pathname}${location.search}`)
    }
  }, [isLoginContext])

  // Tính menu sau khi listTabs / userInfo thay đổi
  useLayoutEffect(() => {
    if (isLoginContext) {
      const filtered = filterMenuByPermission(MenuItemAdmin())
      setMenuAdmin(filtered || [])
    }
  }, [userInfo, listTabs, isLoginContext])

  // Chưa đăng nhập → về login
  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // Đã đăng nhập nhưng listTabs chưa load xong → chờ (tránh flash 403)
  // Chỉ block nếu listTabs là mảng rỗng VÀ đã qua lần render đầu
  if (listTabs.length > 0 && menuAdmin.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <h2 style={{ color: "#ef4444" }}>403 — Không có quyền truy cập</h2>
        <p style={{ color: "#6b7280" }}>
          Tài khoản của bạn không có quyền truy cập khu vực quản trị.
        </p>
      </div>
    )
  }

  return <Outlet />
}

export default AdminRoutes
