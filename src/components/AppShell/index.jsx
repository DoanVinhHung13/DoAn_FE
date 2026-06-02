import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ForceChangePasswordModal from '../Modal/ForceChangePassword'

/**
 * AppShell — global shell logic that runs once auth context is available.
 * Handles mustChangePassword check. Wraps all authenticated content.
 */
const AppShell = ({ children }) => {
  const { userInfo: user } = useSelector((state) => state.appGlobal)
  const [showForceChangePassword, setShowForceChangePassword] = useState(false)

  useEffect(() => {
    if (user && user.mustChangePassword) {
      setShowForceChangePassword(true)
    } else {
      setShowForceChangePassword(false)
    }
  }, [user])

  return (
    <>
      <ForceChangePasswordModal
        visible={showForceChangePassword}
        onSuccess={() => setShowForceChangePassword(false)}
      />
      {children}
    </>
  )
}

export default AppShell

