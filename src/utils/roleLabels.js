const ROLE_LABELS = {
  FARM_MANAGER: 'Quản lý trang trại',
  FARM_SUPERVISOR: 'Giám sát trang trại',
  FARMER_LEADER: 'Tổ trưởng',
  FARMER: 'Nông dân',
}

export const getRoleLabel = (role, fallback = 'Thành viên') => {
  const normalizedRole = String(role ?? '').trim().toUpperCase().replace(/\s+/g, '_')
  return ROLE_LABELS[normalizedRole] || fallback
}

export default ROLE_LABELS
