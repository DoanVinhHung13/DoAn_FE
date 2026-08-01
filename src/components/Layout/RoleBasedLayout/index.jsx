// src/components/Layout/RoleBasedLayout/index.jsx
// Đọc role từ Redux store và render Layout tương ứng.
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import authSession from 'src/redux/authSession'
import { ROLES } from 'src/constants/roles'
import ROUTER from 'src/router/ROUTER'
import LayoutAdmin from 'src/components/Layout/LayoutAdmin'

const LoadingScreen = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      <span style={{ color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>Đang tải hệ thống...</span>
    </div>
  </div>
)

const validRoles = [ROLES.FARM_MANAGER, ROLES.FARM_SUPERVISOR, ROLES.FARM_LEADER]

const RoleBasedLayout = () => {
  const { userInfo } = useSelector((state) => state.appGlobal)
  const role = userInfo?.role

  // Chưa login (không có token)
  if (!authSession.isAuthenticated()) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  // Đã login nhưng /me chưa load xong → hiện spinner
  if (!role) {
    return <LoadingScreen />
  }

  // Role không hợp lệ
  if (!validRoles.includes(role)) {
    return <Navigate to={ROUTER.LOGIN} replace />
  }

  return <LayoutAdmin />
}

export default RoleBasedLayout
