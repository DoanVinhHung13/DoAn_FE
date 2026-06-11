// src/components/Layout/DefaultAction/DefaultAction.jsx
// Boot component: chạy 1 lần khi app mount, không render UI.
// Nhiệm vụ: nếu có token trong Storage → gọi /auth/me → đưa user vào Redux.
import { useEffect } from 'react'
import { useAppDispatch } from 'src/redux/hooks'
import { setUserInfo } from 'src/redux/slices/appGlobalSlice'
import authSession from 'src/store/authSession'
import AuthService from 'src/services/AuthService'

const DefaultAction = ({ children }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Chỉ fetch nếu có token — không phụ thuộc vào Context hay state
    if (!authSession.isAuthenticated()) return

    const restoreUser = async () => {
      try {
        const res = await AuthService.getProfile()
        const meData = res?.data?.data || res?.data || res
        if (!meData?.id) return

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

        // Cập nhật Storage (user info mới nhất) và Redux (reactive UI)
        authSession.updateUser(userData)
        dispatch(setUserInfo(userData))
      } catch (e) {
        console.warn('[DefaultAction] restoreUser failed:', e?.message)
      }
    }

    restoreUser()
  }, []) // Chạy đúng 1 lần khi mount — [] là intentional

  return <>{children}</>
}

export default DefaultAction
