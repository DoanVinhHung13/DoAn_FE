import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import authSession from "src/services/core/authSession";
import ROUTER from "../router/ROUTER";

export const ProtectedRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const token = authSession.getAccessToken();
  // Decode role from token or use mock
  const userRole = localStorage.getItem('mock_role') || "admin"; // Mock role

  if (!token) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to={ROUTER.LOGIN} state={{ returnUrl: location.pathname }} replace />;
  }

  if (roles.length > 0 && !roles.includes(userRole)) {
    // role not authorized so redirect to home page or forbidden page
    return <Navigate to={ROUTER.FORBIDDEN} replace />;
  }

  return children ? children : <Outlet />;
};

export const GuestRoute = ({ children }) => {
  const token = authSession.getAccessToken();
  const location = useLocation();

  
  if (token) {
    const returnUrl = location.state?.returnUrl || ROUTER.HOME;
    return <Navigate to={returnUrl} replace />;
  }

  return children ? children : <Outlet />;
};
