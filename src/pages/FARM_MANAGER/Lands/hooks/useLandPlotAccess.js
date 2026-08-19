import { useMemo } from "react"
import { useSelector } from "react-redux"
import { ROLES } from "src/constants/roles"
import ROUTER from "src/router/ROUTER"

export const getLandPlotRoutes = role => {
  const isFarmManager = role === ROLES.FARM_MANAGER

  if (isFarmManager) {
    return {
      list: ROUTER.FM_LANDS,
      create: ROUTER.FM_LAND_CREATE,
      detail: id => ROUTER.FM_LAND_DETAIL.replace(":id", id),
      edit: id => ROUTER.FM_LAND_EDIT.replace(":id", id),
    }
  }

  return {
    list: ROUTER.FS_LANDS,
    create: null,
    detail: id => ROUTER.FS_LAND_DETAIL.replace(":id", id),
    edit: null,
  }
}

export const useLandPlotAccess = () => {
  const currentUser = useSelector(state => state.appGlobal.userInfo)
  const role = currentUser?.role

  return useMemo(() => {
    const isFarmManager = role === ROLES.FARM_MANAGER
    const isFarmSupervisor = role === ROLES.FARM_SUPERVISOR

    return {
      role,
      isFarmManager,
      isFarmSupervisor,
      canManage: isFarmManager,
      routes: getLandPlotRoutes(role),
    }
  }, [role])
}
