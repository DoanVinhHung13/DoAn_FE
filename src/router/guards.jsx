import { Navigate, Outlet, useLocation } from "react-router-dom"
import authSession from "src/services/core/authSession"
import ROUTER from "../router/ROUTER"

export const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation()
  const token = authSession.getAccessToken()
  const userRole = localStorage.getItem("mock_role")

  if (!token) {
    return (
      <Navigate
        to={ROUTER.HOME}
        state={{ returnUrl: `${location.pathname}${location.search}${location.hash}`, openLogin: true }}
        replace
      />
    )
  }

  if (roles.length > 0 && !roles.includes(userRole)) {
    return <Navigate to={ROUTER.FORBIDDEN} replace />
  }

  return children ? children : <Outlet />
}

export const GuestRoute = ({ children }) => {
  const token = authSession.getAccessToken()
  const location = useLocation()

  if (token) {
    const returnUrl = location.state?.returnUrl || ROUTER.HOME
    return <Navigate to={returnUrl} replace />
  }

  return children ? children : <Outlet />
}

