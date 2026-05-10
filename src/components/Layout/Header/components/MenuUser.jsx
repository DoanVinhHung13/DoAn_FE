import { Avatar, Menu } from "antd"
import { useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import SvgIcon from "src/components/SvgIcon"
import { StoreContext } from "src/contexts"
import STORAGE, { clearStorage, getStorage } from "src/lib/storage"
import { MenuItemAdmin } from "src/router/MenuItem" // Import MenuItemAdmin
import ROUTER from "src/router/ROUTER"
import AuthService from "src/services/AuthService"
import "../popupStyle.scss"
import { StyleMenuAccount } from "../styles"
import { generateInitials } from "src/lib/utils"
import logo from "src/assets/images/logo/logo3.png"

const MenuUser = ({ onOpenChangePassword }) => {
  const [isLogin, setIsLogin] = useState(getStorage(STORAGE.TOKEN))
  const dispatch = useDispatch()
  const { themeStore, loginStore, userStore } = useContext(StoreContext)
  const { userInfo, listTabs } = useSelector(state => state?.appGlobal)
  const { setIsLoginContext } = loginStore
  const { user, setUser } = userStore
  const { isDarkMode } = themeStore
  const [activeKey, setActiveKey] = useState("")
  const { pathname } = window.location

  let navigate = useNavigate()

  useEffect(() => {
    setActiveKey(pathname)
  }, [pathname])

  const handleLogout = async () => {
    if (isLogin) {
      await AuthService.logout()
      clearStorage()
      setIsLogin(false)
      setIsLoginContext(false)
      setUser(null)
      window.location.href = "/"
    }
  }

  // Hàm kiểm tra quyền truy cập admin
  const hasAdminAccess = () => {
    if (!listTabs || !Array.isArray(listTabs)) return false

    // Lấy danh sách TabID từ MenuItemAdmin
    const adminMenuItems = MenuItemAdmin()
    const adminTabIds = new Set()

    // Thu thập tất cả TabID từ menu admin
    adminMenuItems.forEach(item => {
      if (item.TabID) {
        item.TabID.forEach(id => adminTabIds.add(id))
      }
      if (item.children) {
        item.children.forEach(child => {
          if (child.TabID) {
            child.TabID.forEach(id => adminTabIds.add(id))
          }
        })
      }
    })

    // Kiểm tra xem user có ít nhất 1 quyền admin không
    return listTabs.some(
      tab => tab.IsVistTab && adminTabIds.has(tab.CategoryID),
    )
  }

  // Tạo menu items động
  const createMenuItems = () => {
    const baseMenuItems = [
      {
        type: "group",
        label: (
          <div className="account-infor">
            {userInfo?.BasicInfo?.AvatarUrl !== "string" ? (
              <Avatar
                src={userInfo?.BasicInfo?.AvatarUrl || logo}
                size={32}
                className="style-avt"
              />
            ) : (
              <Avatar size={32} className="style-avt">
                {generateInitials(userInfo?.BasicInfo?.FullName)}
              </Avatar>
            )}
            <div className="account-infor-sumary">
              {!!userInfo?.BasicInfo?.FullName && (
                <div className="account-infor-sumary-fullname">
                  {userInfo?.BasicInfo?.FullName}
                </div>
              )}
            </div>
          </div>
        ),
      },
      { type: "divider" },
    ]

    // Chỉ thêm nút "Quản trị hệ thống" nếu user có quyền admin
    if (hasAdminAccess()) {
      baseMenuItems.push({
        key: ROUTER.TONG_QUAN,
        label: (
          <div
            className="btn-function"
            onClick={() => navigate(ROUTER.TONG_QUAN)}
          >
            <SvgIcon name="config" />
            <span className="fw-400">Quản trị hệ thống</span>
          </div>
        ),
      })
    }

    // Thêm các menu items khác
    baseMenuItems.push(
      {
        key: ROUTER.THONG_TIN_TAI_KHOAN,
        label: (
          <div
            className="btn-function"
            onClick={() => navigate(ROUTER.THONG_TIN_TAI_KHOAN)}
          >
            <SvgIcon name="user_login" />
            <span className="fw-400">Thông tin cá nhân</span>
          </div>
        ),
      },
      {
        key: "change-password",
        label: (
          <div
            className="btn-function strok-btn-function"
            onClick={() => onOpenChangePassword && onOpenChangePassword()}
          >
            <SvgIcon name="reset-pass" />
            <span className="fw-400">Đổi mật khẩu</span>
          </div>
        ),
      },
      { type: "divider" },
      {
        key: "logout",
        label: (
          <div
            className="btn-logout"
            style={{ color: "#01b39e" }}
            onClick={handleLogout}
          >
            <SvgIcon name="logoutIcon" />
            Đăng xuất
          </div>
        ),
      },
    )

    return baseMenuItems
  }

  return (
    <StyleMenuAccount isDarkMode={isDarkMode}>
      <div className="menu-account">
        <Menu
          className="dropdown-option"
          items={createMenuItems()}
          selectedKeys={[activeKey]}
        />
      </div>
    </StyleMenuAccount>
  )
}

export default MenuUser
