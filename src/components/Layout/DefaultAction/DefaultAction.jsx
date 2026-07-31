import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'src/redux/hooks'
import { setUserInfo, getListSystemKey } from 'src/redux/slices/appGlobalSlice'
import authSession from 'src/redux/authSession'
import AuthService from 'src/services/AuthService'
import CommonService from 'src/services/CommonService'
import { refreshAccessToken } from 'src/services/tokenRefresh'
import { normalizeRole } from 'src/constants/roles'
import { logDevDiagnostic } from 'src/utils/safeDiagnostic'

const DefaultAction = ({ children }) => {
  const dispatch = useAppDispatch()
  const userInfo = useSelector((state) => state.appGlobal.userInfo)
  useEffect(() => {
    if (!userInfo?.id) return

    const fetchSystemKey = async () => {
      try {
        const res = await CommonService.getSystemKey()
        const data = res?.data?.data || res?.data || res
        if (Array.isArray(data)) {
          dispatch(getListSystemKey(data))
        }
      } catch (error) {
        logDevDiagnostic('load-system-key', error)
      }
    }
    fetchSystemKey()
  }, [userInfo?.id, dispatch])

  useEffect(() => {
    if (!authSession.isAuthenticated()) return

    // Nếu Redux đã có user (do Login component dispatch) → không fetch lại
    // Chỉ fetch khi reload trang (Redux trống nhưng token vẫn còn)
    if (userInfo?._id) return

    const fetchProfile = async () => {
      let meRes
      try {
        meRes = await AuthService.getProfile()
      } catch (error) {
        if (error?.status !== 401) throw error
        const refreshed = await refreshAccessToken()
        if (!refreshed) throw error
        meRes = await AuthService.getProfile()
      }

      return meRes.data
    }

    const restoreUser = async () => {
      try {
        const meData = await fetchProfile()
        const finalId = meData?.id || meData?.userId
        if (!finalId) return

        const userData = {
          _id: finalId,
          id: finalId,
          fullName: meData.fullName,
          email: meData.email,
          phoneNumber: meData.phoneNumber,
          avatarUrl: meData.avatarUrl,
          isActive: meData.isActive,
          lastLoginAt: meData.lastLoginAt,
          dateOfBirth: meData.dateOfBirth,
          gender: meData.gender,
          address: meData.address,
          role: normalizeRole(meData.roles?.[0]),
          roles: meData.roles || [],
        }

        authSession.updateUser(userData)
        dispatch(setUserInfo(userData))
      } catch (error) {
        logDevDiagnostic('restore-user', error)
      }
    }

    restoreUser()
  }, [dispatch, userInfo?._id])

  return <>{children}</>
}

export default DefaultAction
