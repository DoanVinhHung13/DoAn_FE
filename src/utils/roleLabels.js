const ROLE_LABELS = {
  FARM_MANAGER: "Quản lý nông trại",
  FARM_SUPERVISOR: "Giám sát nông trại",
  FARMER_LEADER: "Tổ trưởng",
  FARMER: "Nông dân",
}

export const getRoleLabel = (role, fallback = "Thành viên") => {
  const normalizedRole = String(role ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
  return ROLE_LABELS[normalizedRole] || fallback
}

export default ROLE_LABELS
