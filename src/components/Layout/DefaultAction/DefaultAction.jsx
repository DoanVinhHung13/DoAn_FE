// src/components/Layout/DefaultAction/DefaultAction.jsx
// Boot component: chạy 1 lần khi app mount, không render UI.
// Nhiệm vụ: nếu có token trong Storage → gọi /auth/me → đưa user vào Redux.
import { useEffect } from 'react'
import { useAppDispatch } from 'src/redux/hooks'
import { setUserInfo } from 'src/redux/slices/appGlobalSlice'
import authSession from 'src/redux/authSession'
import AuthService from 'src/services/AuthService'
import { refreshAccessToken } from 'src/services/tokenRefresh'
import { normalizeRole } from 'src/constants/roles'

const DefaultAction = ({ children }) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Chỉ fetch nếu có token — không phụ thuộc vào Context hay state
    if (!authSession.isAuthenticated()) return

    const fetchProfile = async () => {
      try {
        return await AuthService.getProfile()
      } catch {
        const refreshed = await refreshAccessToken()
        if (!refreshed) throw new Error('Phiên đăng nhập đã hết hạn')
        return AuthService.getProfile()
      }
    }

    const restoreUser = async () => {
      try {
        const res = await fetchProfile()
        const meData = res?.data?.data || res?.data || res
        const finalId = meData?.userId || meData?.id
        if (!finalId) return

        const userData = {
          _id:         finalId,
          id:          finalId,
          fullName:    meData.fullName,
          email:       meData.email,
          phoneNumber: meData.phoneNumber,
          avatarUrl:   meData.avatarUrl,
          isActive:    meData.isActive,
          lastLoginAt: meData.lastLoginAt,
          dateOfBirth: meData.dateOfBirth,
          gender:      meData.gender,
          role:        normalizeRole(meData.roles?.[0]),
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
