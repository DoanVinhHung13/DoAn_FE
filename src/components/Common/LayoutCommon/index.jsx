import { Outlet } from "react-router-dom"
import PublicFooter from "src/components/Layout/Footer"
import PublicNavbar from "src/components/Layout/Header"

const LayoutCommon = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <div className="pt-20">
        {/* Offset for fixed navbar */}
        <Outlet />
      </div>
      <PublicFooter />
    </div>
  )
}

export default LayoutCommon
