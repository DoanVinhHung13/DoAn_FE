import ROUTER from './ROUTER'
import { ROLES, normalizeRole } from 'src/constants/roles'

const ROLE_DASHBOARD_PATHS = {
  [ROLES.FARM_MANAGER]:     ROUTER.FM_DASHBOARD,
  [ROLES.FARM_SUPERVISOR]:  ROUTER.FS_PLANS,
  [ROLES.FARM_LEADER]:      ROUTER.FL_TASKS,
  [ROLES.FARMER]:           ROUTER.FARMER_DASHBOARD,
}

/** Đường dẫn dashboard mặc định theo role — dùng chung cho GuestRoute, Login, v.v. */
export const getDashboardPathByRole = (role) =>
  ROLE_DASHBOARD_PATHS[normalizeRole(role)] ?? ROUTER.LOGIN

export default getDashboardPathByRole
