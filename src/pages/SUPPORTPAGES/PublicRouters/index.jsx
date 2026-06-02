// src/pages/SUPPORTPAGES/PublicRouters/index.jsx
import { Outlet } from "react-router-dom"

/**
 * PublicRouters — Wrapper cho các route không cần đăng nhập.
 * Không có layout (Landing, News, TCVN…).
 */
function PublicRouters() {
  return <Outlet />
}

export default PublicRouters
