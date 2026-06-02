// src/components/Layout/DefaultAction/DefaultAction.jsx
// Component chạy 1 lần khi mount, không render UI. Khởi tạo data toàn app.
import { useContext, useEffect } from "react"
import { StoreContext } from "src/contexts"
import { useAppDispatch } from "src/redux/hooks"
import { getListSystemKey, setListTabs, setUserInfo } from "src/redux/slices/appGlobalSlice"
import STORAGE, { getStorage } from "src/lib/storage"
import UserService   from "src/services/UserService"
import RoleService   from "src/services/RoleService"
import CommonService from "src/services/CommonService"

const DefaultAction = ({ children }) => {
  const isLogin = getStorage(STORAGE.TOKEN)
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext, setIsLoginContext } = loginStore
  const dispatch = useAppDispatch()

  // 1. Lấy cấu hình hệ thống (dropdown, loại…)
  const getSystemKey = async () => {
    try {
      const res = await CommonService.getSystemKey("All")
      if (res && !res?.IsError) dispatch(getListSystemKey(res?.Object))
    } catch (e) {
      console.warn("[DefaultAction] getSystemKey skipped:", e?.message)
    }
  }

  // 2. Lấy danh sách tab quyền của user
  const getListTab = async () => {
    try {
      const res = await RoleService.getListTab()
      if (res?.isOk) dispatch(setListTabs(res?.Object))
      // Fallback: nếu API trả về theo format khác (Status === 0)
      else if (res?.Status === 0 && res?.Object) dispatch(setListTabs(res?.Object))
    } catch (e) {
      console.warn("[DefaultAction] getListTab skipped:", e?.message)
    }
  }

  // 3. Lấy thông tin user
  const getUserInfo = async () => {
    try {
      const res = await UserService.getInforUser()
      if (res && !res?.IsError) dispatch(setUserInfo(res?.Object ?? res?.data ?? res))
    } catch (e) {
      console.warn("[DefaultAction] getUserInfo skipped:", e?.message)
    }
  }

  // Chạy 1 lần lúc mount — khởi tạo trạng thái login
  useEffect(() => {
    getSystemKey()
    setIsLoginContext(!!isLogin)
  }, [])

  // Khi đã login → lấy quyền + userInfo
  useEffect(() => {
    if (isLoginContext) {
      getListTab()
      getUserInfo()
    }
  }, [isLoginContext])

  return <>{children}</>
}

export default DefaultAction
