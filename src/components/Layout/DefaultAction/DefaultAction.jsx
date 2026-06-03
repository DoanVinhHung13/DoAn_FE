// src/components/Layout/DefaultAction/DefaultAction.jsx
// Component chạy 1 lần khi mount, không render UI. Khởi tạo data toàn app.
import { useContext, useEffect } from "react"
import { StoreContext } from "src/contexts"
import { useAppDispatch } from "src/redux/hooks"
import { setUserInfo } from "src/redux/slices/appGlobalSlice"
import STORAGE, { getStorage } from "src/lib/storage"
import AuthService from "src/services/AuthService"

const DefaultAction = ({ children }) => {
  const isLogin = getStorage(STORAGE.TOKEN)
  const { loginStore } = useContext(StoreContext)
  const { isLoginContext, setIsLoginContext } = loginStore
  const dispatch = useAppDispatch()

  // Lấy thông tin user đăng nhập
  const getMeInfo = async () => {
    try {
      const res = await AuthService.getProfile()
      // API trả { success, message, data: { id, fullName, roles, ... } }
      const meData = res?.data?.data || res?.data || res
      if (meData?.id) {
        const userData = {
          _id:         meData.id,
          id:          meData.id,
          fullName:    meData.fullName,
          email:       meData.email,
          phoneNumber: meData.phoneNumber,
          avatarUrl:   meData.avatarUrl,
          isActive:    meData.isActive,
          lastLoginAt: meData.lastLoginAt,
          dateOfBirth: meData.dateOfBirth,
          gender:      meData.gender,
          role:        meData.roles?.[0] || null,
          roles:       meData.roles || [],
        }
        dispatch(setUserInfo(userData))
      }
    } catch (e) {
      console.warn("[DefaultAction] getMeInfo skipped:", e?.message)
    }
  }

  // Chạy 1 lần lúc mount — khởi tạo trạng thái login
  useEffect(() => {
    setIsLoginContext(!!isLogin)
  }, [])

  // Khi đã login → lấy thông tin user
  useEffect(() => {
    if (isLoginContext) {
      getMeInfo()
    }
  }, [isLoginContext])

  return <>{children}</>
}

export default DefaultAction
