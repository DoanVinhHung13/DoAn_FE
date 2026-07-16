// Role constants — phải khớp đúng với giá trị BE trả về trong roles[]
export const ROLES = {
  FARM_MANAGER: "FARM_MANAGER",
  FARM_SUPERVISOR: "FARM_SUPERVISOR",
  LAND_MANAGER: "LAND_MANAGER",
  MATERIAL_MANAGER: "MATERIAL_MANAGER",
  FARMER: "FARMER",
}

export const normalizeRole = (apiRole) => {
  if (!apiRole) return null
  const normalized = String(apiRole).toUpperCase().replace(/[\s_]/g, '')
  if (normalized === "FARMMANAGER") return ROLES.FARM_MANAGER
  if (normalized === "FARMSUPERVISOR") return ROLES.FARM_SUPERVISOR
  if (normalized === "LANDMANAGER") return ROLES.LAND_MANAGER
  if (normalized === "MATERIALMANAGER") return ROLES.MATERIAL_MANAGER
  if (normalized === "FARMER") return ROLES.FARMER
  return apiRole // fallback
}

export default ROLES

