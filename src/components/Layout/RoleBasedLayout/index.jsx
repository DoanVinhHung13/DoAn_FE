// src/components/Layout/RoleBasedLayout/index.jsx
// Đọc role từ Redux store và render Layout (Sidebar + Header) tương ứng.
// 4 Role: FARM_MANAGER, LAND_MANAGER, MATERIAL_MANAGER, FARMER
// Tất cả đều dùng LayoutAdmin (dynamic sidebar từ MenuItem)
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { StoreContext } from 'src/contexts'
import { ROLES } from 'src/constants/roles'
import ROUTER from 'src/router/ROUTER'

import LayoutAdmin from 'src/components/Layout/LayoutAdmin'

// Spinner đơn giản trong lúc chờ load role
const LoadingScreen = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>
        Đang tải hệ thống...
      </span>
    </div>
  </div>
)

const RoleBasedLayout = () => {
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext } = loginStore
  const { userInfo } = useSelector((state) => state.appGlobal)
  const role = userInfo?.role

  // Chưa login → PrivateRoutes đã xử lý redirect, không cần làm gì ở đây
  if (!isLoginContext) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // Đã login nhưng role chưa load xong (đang gọi /auth/me) → hiện spinner
  if (!role) {
    return <LoadingScreen />
  }

  // Tất cả 4 role đều dùng LayoutAdmin (dynamic sidebar từ MenuItem)
  // Nếu role không hợp lệ → redirect về login
  const validRoles = [ROLES.FARM_MANAGER, ROLES.LAND_MANAGER, ROLES.MATERIAL_MANAGER, ROLES.FARMER]
  if (!validRoles.includes(role)) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <LayoutAdmin />
}

export default RoleBasedLayout
