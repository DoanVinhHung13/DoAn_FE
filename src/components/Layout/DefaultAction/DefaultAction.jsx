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
    if (!authSession.isAuthenticated()) return

    const fetchProfile = async () => {
      let meRes = await AuthService.getProfile()

      if (!meRes?.success) {
        const refreshed = await refreshAccessToken()
        if (!refreshed) throw new Error('Phiên đăng nhập đã hết hạn')
        meRes = await AuthService.getProfile()
      }

      if (!meRes?.success) {
        throw new Error(meRes?.message || 'Không thể tải thông tin người dùng')
      }

      return meRes.data
    }

    const restoreUser = async () => {
      try {
        const meData = await fetchProfile()
        const finalId = meData?.id || meData?.userId
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

        authSession.updateUser(userData)
        dispatch(setUserInfo(userData))
      } catch (e) {
        console.warn('[DefaultAction] restoreUser failed:', e?.message)
      }
    }

    restoreUser()
  }, [])

  return <>{children}</>
}

export default DefaultAction
