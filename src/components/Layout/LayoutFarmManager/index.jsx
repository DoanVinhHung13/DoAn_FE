import { useState } from 'react'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'src/redux/hooks'
import { setUserInfo } from 'src/redux/slices/appGlobalSlice'
import { getAvatarUrl, getInitialAvatar } from 'src/lib/utils'
import { clearStorage } from 'src/lib/storage'
import http from 'src/services/01_axios'
import NotificationBell from 'src/components/NotificationBell'
import {
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  AppstoreOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  BellOutlined,
  LockOutlined,
  SettingOutlined,
  BarChartOutlined,
  CloudOutlined,
  BoxPlotOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import {
  LayoutDashboard,
  MapPin,
  Sprout,
  Package,
  ClipboardList,
  Boxes,
  Users,
  FileCheck,
} from 'lucide-react'
import ROUTER from 'src/router/ROUTER'
import { ROLES } from 'src/constants/roles'
import logoImg from 'src/assets/images/logo/logo-ebookfarm.jpg'

const { Header, Sider, Content } = Layout
const { Text } = Typography
const { useBreakpoint } = require('antd').Grid

const LayoutFarmManager = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { userInfo: user } = useSelector((state) => state.appGlobal)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const handleLogout = async () => {
    try {
      await http.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearStorage()
      dispatch(setUserInfo({}))
      window.location.href = ROUTER.LOGIN
    }
  }

  const menuItems = [
    {
      key: ROUTER.FM_DASHBOARD,
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: <span className="font-medium">Tổng quan</span>,
    },
    {
      key: ROUTER.FM_USERS,
      icon: <TeamOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý người dùng</span>,
    },
    {
      key: ROUTER.FM_LANDS,
      icon: <MapPin className="w-5 h-5" />,
      label: <span className="font-medium">Quản lý lô đất</span>,
    },
    {
      key: ROUTER.FM_CROP_CATALOGS,
      icon: <Sprout className="w-5 h-5" />,
      label: <span className="font-medium">Danh mục cây trồng</span>,
    },
    {
      key: ROUTER.FM_CROPS,
      icon: <EnvironmentOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý cây trồng</span>,
    },
    {
      key: ROUTER.FM_PRODUCTION_PLANS,
      icon: <ClipboardList className="w-5 h-5" />,
      label: <span className="font-medium">Kế hoạch sản xuất</span>,
    },
    {
      key: ROUTER.FM_TASKS,
      icon: <CheckSquareOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý tác vụ</span>,
    },
    {
      key: ROUTER.FM_LOGBOOKS,
      icon: <FileTextOutlined className="text-lg" />,
      label: <span className="font-medium">Nhật ký sản xuất</span>,
    },
    {
      key: ROUTER.FM_BATCHES,
      icon: <Boxes className="w-5 h-5" />,
      label: <span className="font-medium">Quản lý lô sản phẩm</span>,
    },
    {
      key: ROUTER.FM_NOTIFICATIONS,
      icon: <BellOutlined className="text-lg" />,
      label: <span className="font-medium">Phát hành thông báo</span>,
    },
    {
      key: 'material-submenu',
      icon: <Package className="w-5 h-5" />,
      label: <span className="font-medium">Tra cứu vật tư</span>,
      children: [
        { key: ROUTER.FM_VIEW_FERTILIZERS, icon: <CloudOutlined />, label: 'Phân bón' },
        { key: ROUTER.FM_VIEW_CROP_PROTECTIONS, icon: <BoxPlotOutlined />, label: 'Thuốc BVTV' },
        { key: ROUTER.FM_VIEW_PURCHASE_REQS, icon: <ShoppingOutlined />, label: 'Yêu cầu mua sắm' },
      ],
    },
  ]

  const dropdownItems = [
    {
      key: 'user-header',
      label: (
        <div className="p-2 min-w-[160px]">
          <Text strong className="block text-gray-800">
            {user?.fullname || user?.username || 'Quản lý'}
          </Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            Farm Manager
          </Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    { key: '1', icon: <UserOutlined />, label: 'Thông tin cá nhân', className: 'rounded-lg mb-1' },
    { key: '2', icon: <LockOutlined />, label: 'Đổi mật khẩu', className: 'rounded-lg mb-1' },
    { type: 'divider' },
    { key: '3', danger: true, icon: <LogoutOutlined />, label: 'Đăng xuất', className: 'rounded-lg' },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === '1') navigate(ROUTER.ACCOUNT_INFO)
    else if (key === '2') navigate(ROUTER.CHANGE_PASSWORD)
    else if (key === '3') handleLogout()
  }

  const handleNavItemClick = ({ key }) => {
    navigate(key)
    if (isMobile) setMobileMenuOpen(false)
  }

  const getSelectedKey = () => {
    const path = location.pathname
    for (const item of menuItems) {
      if (item.key === path) return [path]
      if (item.children) {
        const childMatch = item.children.find((child) => child.key === path)
        if (childMatch) return [path]
      }
    }
    return [path]
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div
        className="h-24 flex flex-col items-center justify-center border-b border-gray-50 px-4 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-all"
        onClick={() => navigate(ROUTER.FM_DASHBOARD)}
      >
        {collapsed && !isMobile ? (
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logoImg} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
          </div>
        ) : (
          <div className="flex items-center gap-4 w-full justify-center">
            <img src={logoImg} alt="Logo" className="w-[55px] h-[55px] object-contain mix-blend-multiply" />
            <div className="flex flex-col text-center">
              <span className="text-green-600 font-bold text-[13px] leading-[1.2]">FARM MANAGER</span>
              <span className="text-gray-500 text-[10px] leading-[1.2]">VietGAP System</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scroll">
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={handleNavItemClick}
          className="border-r-0 px-3 py-4"
        />
      </div>
    </div>
  )

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          width={280}
          className="shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-50 flex flex-col h-screen sticky top-0"
        >
          {sidebarContent}
        </Sider>
      )}

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
          className={`bg-white/80 backdrop-blur-md p-0 flex justify-between items-center z-10 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-gray-50 ${
            isMobile ? 'px-4 h-16' : 'px-8 h-20'
          }`}
        >
          <Button
            type="text"
            icon={<MenuOutlined className="text-green-600 text-xl" />}
            onClick={() => (isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed))}
            className="w-10 h-10 flex items-center justify-center hover:bg-green-50 rounded-xl transition-all"
          />

          <div className="flex items-center gap-2 md:gap-6">
            <Space size={isMobile ? 8 : 16} className="mr-0 md:mr-4">
              <NotificationBell />
            </Space>

            {!isMobile && <div className="h-10 w-[1px] bg-gray-100" />}

            <Dropdown
              menu={{ items: dropdownItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={['click']}
              arrow={{ pointAtCenter: true }}
            >
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer group hover:bg-green-50/50 p-1.5 md:pr-3 rounded-2xl transition-all border border-transparent hover:border-green-100">
                <Avatar
                  size={isMobile ? 32 : 44}
                  src={getAvatarUrl(user?.avatar)}
                  className="bg-green-50 text-green-600 border-2 border-green-200 group-hover:border-green-400 transition-all font-bold shadow-sm"
                >
                  {!user?.avatar && getInitialAvatar(user?.fullname || user?.username || 'FM')}
                </Avatar>
                {!isMobile && (
                  <div className="text-left flex flex-col justify-center">
                    <Text className="font-bold text-gray-800 group-hover:text-green-600 transition-colors block text-sm leading-tight">
                      {user?.fullname || user?.username || 'Farm Manager'}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Farm Manager
                    </Text>
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className={`${isMobile ? 'p-4' : 'p-8'} bg-[#f8fafc] min-h-[calc(100vh-80px)]`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default LayoutFarmManager
