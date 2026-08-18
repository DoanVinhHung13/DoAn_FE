import React, { useState } from "react"
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Drawer,
  Grid,
} from "antd"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { useAppDispatch } from "src/redux/hooks"
import { setUserInfo } from "src/redux/slices/appGlobalSlice"
import { getAvatarUrl, getInitialAvatar } from "src/utils/helpers"
import { clearAuthStorage } from "src/redux/storage"
import AuthService from "src/services/AuthService"
import NotificationBell from "src/components/NotificationBell"
import {
  DownOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { getMenuByRole } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import logoImg from "src/assets/images/logo/logo-eapls.jpg"
import { logDevDiagnostic } from "src/utils/safeDiagnostic"
import { getRoleLabel } from "src/utils/roleLabels"

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { useBreakpoint } = Grid

const LayoutAdmin = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { userInfo: user } = useSelector(state => state.appGlobal)
  const dispatch = useAppDispatch()
  const logout = () => {
    clearAuthStorage()
    dispatch(setUserInfo({}))
    window.location.href = "/login"
  }
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()

  const isMobile = !screens.md

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      logDevDiagnostic("logout", error)
    } finally {
      logout()
      navigate("/login")
    }
  }

  // Lấy menu theo role từ MenuItem.jsx
  const menuItems = getMenuByRole(user?.role)

  const selectedKey =
    menuItems
      .flatMap(item => (item.children ? [item, ...item.children] : [item]))
      .filter(item => item.key && location.pathname.startsWith(item.key))
      .sort((a, b) => b.key.length - a.key.length)
      .at(0)?.key || location.pathname

  const dropdownItems = [
    {
      key: "user-header",
      label: (
        <div className="p-2 min-w-[160px]">
          <Text strong className="block text-gray-800">
            {user?.fullName || user?.email?.split("@")[0] || "Thành viên"}
          </Text>
          <Text
            type="secondary"
            className="text-[10px] uppercase font-bold text-gray-400 tracking-widest"
          >
            {getRoleLabel(user?.role)}
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "1",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      className: "rounded-lg mb-1",
    },
    {
      key: "2",
      icon: <LogoutOutlined />,
      label: "Đổi mật khẩu",
      className: "rounded-lg mb-1",
    },
    { type: "divider" },
    {
      key: "3",
      danger: true,
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      className: "rounded-lg",
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === "1") navigate(ROUTER.ACCOUNT_INFO)
    else if (key === "2") navigate(ROUTER.CHANGE_PASSWORD)
    else if (key === "3") handleLogout()
  }

  const handleNavItemClick = ({ key }) => {
    navigate(key)
    if (isMobile) setMobileMenuOpen(false)
  }

  const sidebarContent = (
    <div className="admin-sidebar flex flex-col h-full bg-white">
      {/* Logo/Branding Section */}
      <div
        className="admin-brand h-20 flex flex-col items-center justify-center border-b border-gray-100 px-2 shrink-0 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label="Về trang chủ"
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") navigate(ROUTER.HOME)
        }}
        onClick={() => navigate(ROUTER.HOME)}
      >
        {collapsed && !isMobile ? (
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src={logoImg}
              alt="EAPLS"
              className="max-w-full max-h-full object-contain mix-blend-multiply"
            />
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-2">
            <img
              src={logoImg}
              alt="EAPLS"
              className="h-9 w-9 shrink-0 object-contain mix-blend-multiply"
            />
            <span className="admin-brand-title text-green-600">
              NHẬT KÝ CANH TÁC
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scroll transition-all duration-300">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={[]}
          items={menuItems}
          onClick={handleNavItemClick}
          className="admin-navigation border-r-0 px-3 py-4"
          expandIcon={
            collapsed
              ? null
              : ({ isOpen }) => (
                  <DownOutlined
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                )
          }
        />
      </div>

      {/* Support Card */}
      {/* {(!collapsed || isMobile) && (
        <div className="p-6 mt-auto border-t border-gray-50 shrink-0 bg-white">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100 shadow-sm shadow-green-50/50">
            <Text strong className="text-green-800 text-xs block mb-1">
              Hỗ trợ kỹ thuật?
            </Text>
            <Text className="text-green-600 text-[10px] block mb-3">Liên hệ hotline: 0981.439.283</Text>
            <Button type="primary" size="small" block className="rounded-lg text-[10px] h-8 font-bold">
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      )} */}
    </div>
  )

  return (
    <Layout className="min-h-screen bg-white">
      {/* Sider for Desktop */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          width={280}
          collapsedWidth={72}
          className="admin-sider border-r border-gray-100 flex flex-col h-screen sticky top-0"
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Drawer for Mobile */}
      <Drawer
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
        width={280}
        closable={false}
      >
        {sidebarContent}
      </Drawer>

      <Layout>
        <Header
          className={`admin-header bg-white p-0 flex justify-between items-center z-10 sticky top-0 border-b border-gray-100 ${
            isMobile ? "px-4 h-16" : "px-8 h-20"
          }`}
        >
          <Button
            type="text"
            icon={<MenuOutlined className="text-green-600 text-xl" />}
            aria-label={
              isMobile
                ? "Mở menu điều hướng"
                : collapsed
                  ? "Mở rộng menu điều hướng"
                  : "Thu gọn menu điều hướng"
            }
            onClick={() =>
              isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)
            }
            className="w-10 h-10 flex items-center justify-center hover:bg-green-50 rounded-lg"
          />

          <div className="flex items-center gap-2 md:gap-6">
            <Space size={isMobile ? 8 : 16} className="mr-0 md:mr-4">
              <NotificationBell />
            </Space>

            {!isMobile && <div className="h-10 w-[1px] bg-gray-100" />}

            <Dropdown
              menu={{ items: dropdownItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={["click"]}
              arrow={{ pointAtCenter: true }}
              classNames={{ root: "premium-auth-dropdown" }}
            >
              <button
                type="button"
                aria-label="Mở menu tài khoản"
                className="admin-account-trigger flex items-center gap-2 md:gap-3 cursor-pointer group hover:bg-green-50/50 p-1.5 md:pr-3 rounded-2xl transition-all hover:border-green-100"
              >
                <Avatar
                  size={isMobile ? 32 : 44}
                  src={getAvatarUrl(user?.avatarUrl)}
                  className="bg-green-50 text-green-600 border-2 border-green-200 group-hover:border-green-400 transition-all font-bold shadow-sm"
                >
                  {!user?.avatarUrl &&
                    getInitialAvatar(
                      user?.fullName || user?.email?.split("@")[0] || "U",
                    )}
                </Avatar>
                {!isMobile && (
                  <div className="text-left flex flex-col justify-center">
                    <Text className="font-bold text-gray-800 group-hover:text-green-600 transition-colors block text-sm leading-tight">
                      {user?.fullName ||
                        user?.email?.split("@")[0] ||
                        "Thành viên"}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {getRoleLabel(user?.role)}
                    </Text>
                  </div>
                )}
                <DownOutlined className="text-xs text-gray-400 transition-colors group-hover:text-green-600 md:text-sm" />
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content
          className={`admin-content ${isMobile ? "p-4" : "p-8"} min-h-[calc(100vh-80px)]`}
        >
          <div className="admin-page-shell">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutAdmin
