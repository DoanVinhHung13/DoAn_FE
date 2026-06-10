import ROUTER from './ROUTER'
import { ROLES, normalizeRole } from 'src/constants/roles'

const ROLE_DASHBOARD_PATHS = {
  [ROLES.FARM_MANAGER]: ROUTER.FM_DASHBOARD,
  [ROLES.LAND_MANAGER]: ROUTER.LM_DASHBOARD,
  [ROLES.MATERIAL_MANAGER]: ROUTER.MM_DASHBOARD,
  [ROLES.FARMER]: ROUTER.FARMER_DASHBOARD,
}

/** Đường dẫn dashboard mặc định theo role — dùng chung cho GuestRoute, Login, v.v. */
export const getDashboardPathByRole = (role) =>
  ROLE_DASHBOARD_PATHS[normalizeRole(role)] ?? ROUTER.LOGIN

export default getDashboardPathByRole
