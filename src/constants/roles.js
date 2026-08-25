// Role constants — phải khớp đúng với giá trị BE trả về trong roles[]
export const ROLES = {
  FARM_MANAGER: "FARM_MANAGER",
  FARM_SUPERVISOR: "FARM_SUPERVISOR",
  FARMER_LEADER: "FARMER_LEADER",
  FARMER: "FARMER",
}

export const normalizeRole = apiRole => {
  if (!apiRole) return null
  const normalized = String(apiRole).toUpperCase().replace(/[\s_]/g, "")
  if (normalized === "FARMMANAGER") return ROLES.FARM_MANAGER
  if (normalized === "FARMSUPERVISOR") return ROLES.FARM_SUPERVISOR
  if (normalized === "FARMERLEADER") return ROLES.FARMER_LEADER
  if (normalized === "FARMER") return ROLES.FARMER
  return apiRole // fallback
}

export default ROLES
