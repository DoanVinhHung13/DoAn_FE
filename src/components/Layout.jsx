import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography, Drawer, Grid } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import STORAGE, { clearStorage } from 'src/lib/storage';
import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers';
import api from 'src/services/01_axios';
import NotificationBell from 'src/components/NotificationBell';
import {
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  FileTextOutlined,
  SettingOutlined,
  BellOutlined,
  BorderOutlined,
  LockOutlined,
  BarChartOutlined,
  InboxOutlined,
  ReadOutlined,
  PhoneOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Leaf, BoxSelect, Droplet, Sprout, Tractor, Fish, ChevronDown, RefreshCcw } from 'lucide-react';
import logoImg from 'src/assets/images/logo/logo-ebookfarm.jpg';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state.appGlobal.userInfo);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const handleLogout = async () => {
    try {
      // Call logout API to log the activity
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always logout from frontend
      clearStorage();
      dispatch(setUserInfo({}));
      navigate('/login');
    }
  };

  const getAdminItems = () => [
    {
      key: '/dashboard',
      icon: <AppstoreOutlined className="text-lg" />,
      label: <span className="font-medium">Tổng quan</span>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined className="text-lg" />,
      label: <span className="font-medium">Báo cáo & Thống kê</span>,
    },
    {
      key: '/account-info',
      icon: <UserOutlined className="text-lg" />,
      label: <span className="font-medium">Thông tin tài khoản</span>,
    },
    {
      key: '/form-builder',
      icon: <FileTextOutlined className="text-lg" />,
      label: <span className="font-medium">Biểu mẫu nhật ký</span>,
    },
    {
      key: '/tcvn',
      icon: <ReadOutlined className="text-lg" />,
      label: <span className="font-medium">Tra cứu TCVN</span>,
    },
    {
      key: '/admin/news',
      icon: <FileTextOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý tin tức</span>,
    },
    {
      key: '/admin/consultations',
      icon: <PhoneOutlined className="text-lg" />,
      label: <span className="font-medium">Yêu cầu tư vấn</span>,
    },
    {
      key: '/agriculture-models',
      icon: <GlobalOutlined className="text-lg" />,
      label: <span className="font-medium">Mô hình nông nghiệp</span>,
    },
    {
      key: '/admin/journals',
      icon: <SettingOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý nhật ký</span>,
    },
    {
      key: 'inventory-mgmt',
      icon: <Tractor className="w-5 h-5" />,
      label: <span className="font-medium">Quản lý kho vật tư</span>,
      children: [
        { key: '/inventory/categories', label: 'Danh mục vật tư' },
        { key: '/inventory/items', label: 'Kho tổng vật tư' },
      ],
    },
    {
      key: '/admin/accounts-mgmt',
      icon: <BorderOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý tài khoản</span>,
      children: [
        { key: '/admin/users', label: 'Danh sách tài khoản' },
        { key: '/admin/groups', label: 'Quản Lý HTX' },
        { key: '/admin/roles', label: 'Phân quyền & Vai trò' },
      ],
    },
    {
      key: 'customer-mgmt',
      icon: <GlobalOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý khách hàng</span>,
      children: [
        { key: '/admin/customers', label: 'Danh sách khách hàng' },
        { key: '/admin/customer-rights', label: 'Quản lý quyền tài khoản thành viên' },
      ],
    },
    {
      key: '/admin/logs',
      icon: <SettingOutlined className="text-lg" />,
      label: <span className="font-medium">Nhật ký hệ thống</span>,
    },
    {
      key: 'ai-developer-tools',
      icon: <ThunderboltOutlined className="text-lg" />,
      label: <span className="font-medium">Công cụ AI (Dev)</span>,
      children: [
        { key: '/admin/groq-test', label: 'Test Groq AI' },
        { key: '/admin/rag-test', label: 'Test RAG System' },
        { key: '/admin/chat-stats', label: 'Thống kê Chat AI' },
      ],
    },
    {
      key: 'system-config',
      icon: <SettingOutlined className="text-lg" />,
      label: <span className="font-medium">Cấu hình hệ thống</span>,
      children: [
        { key: '/admin/backup', label: 'Sao lưu & Phục hồi dữ liệu' },
      ],
    },
  ];

  const getFarmerItems = () => [
    {
      key: '/dashboard',
      icon: <AppstoreOutlined className="text-lg" />,
      label: <span className="font-medium">Tổng quan</span>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined className="text-lg" />,
      label: <span className="font-medium">Báo cáo & Thống kê</span>,
    },
    {
      key: 'vietgap',
      icon: <Sprout className="w-[18px] h-[18px] text-green-600" />,
      label: <span className="font-medium">Sản xuất VietGAP</span>,
      className: 'custom-farmer-submenu',
      children: [
        { key: '/vietgap/trong-trot', label: 'VietGAP Trồng trọt' },
        { key: '/vietgap/chan-nuoi', label: 'VietGAHP Chăn nuôi' },
        { key: '/vietgap/thuy-san', label: 'VietGAP Thủy sản' },
      ],
    },
    {
      key: 'huuco',
      icon: <Leaf className="w-5 h-5 text-green-600" />,
      label: <span className="font-medium">Nông nghiệp hữu cơ</span>,
      className: 'custom-farmer-submenu',
      children: [
        { key: '/huuco/cay-trong', label: 'Cây trồng' },
        { key: '/huuco/chan-nuoi', label: 'Chăn nuôi' },
        { key: '/huuco/thuy-san', label: 'Thủy sản' },
      ],
    },
    {
      key: 'thongminh',
      icon: <RefreshCcw className="w-[18px] h-[18px] text-green-600" />,
      label: <span className="font-medium">Nông nghiệp thông minh</span>,
      className: 'custom-farmer-submenu',
      children: [
        { key: '/thongminh/rau-cu-qua', label: 'Rau củ quả' },
        { key: '/thongminh/lua', label: 'Lúa' },
        { key: '/thongminh/chan-nuoi', label: 'Chăn nuôi' },
      ],
    },
    {
      key: '/inventory/farmer',
      icon: <InboxOutlined className="text-lg" />,
      label: <span className="font-medium">Tồn kho</span>,
    },
    {
      key: 'docs-submenu',
      icon: <ReadOutlined className="text-lg" />,
      label: <span className="font-medium">Tiêu chuẩn & Quy trình</span>,
      children: [
        { key: '/docs', label: 'Quy trình kỹ thuật' },
        { key: '/tcvn', label: 'Tra cứu TCVN' },
      ],
    },
  ];

  const getHtxItems = () => [
    {
      key: '/dashboard',
      icon: <AppstoreOutlined className="text-lg" />,
      label: <span className="font-medium">Tổng quan HTX</span>,
    },
    {
      key: '/reports',
      icon: <BarChartOutlined className="text-lg" />,
      label: <span className="font-medium">Báo cáo & Thống kê</span>,
    },
    {
      key: '/htx/farmers',
      icon: <TeamOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý nông dân</span>,
    },
    {
      key: '/htx/journals',
      icon: <SettingOutlined className="text-lg" />,
      label: <span className="font-medium">Quản lý sổ HTX</span>,
    },
    {
      key: '/inventory',
      icon: <InboxOutlined className="text-lg" />,
      label: <span className="font-medium">Kho vật tư tập trung</span>,
    },
  ];

  const items = user?.role?.toUpperCase() === 'ADMIN'
    ? getAdminItems()
    : user?.role?.toUpperCase() === 'HTX'
      ? getHtxItems()
      : getFarmerItems();

  const dropdownItems = [
    {
      key: 'user-header',
      label: (
        <div className="p-2 min-w-[160px]">
          <Text strong className="block text-gray-800">{user?.fullname || user?.username || 'Thành viên'}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{user?.role || 'User'}</Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      className: 'rounded-lg mb-1'
    },
    {
      key: '2',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      className: 'rounded-lg mb-1'
    },
    { type: 'divider' },
    {
      key: '3',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      className: 'rounded-lg'
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === '1') {
      navigate('/account-info');
    } else if (key === '2') {
      navigate('/change-password');
    } else if (key === '3') {
      handleLogout();
    }
  };

  const handleNavItemClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo/Branding Section - Fixed at top */}
      <div
        className="h-24 flex flex-col items-center justify-center border-b border-gray-50 px-4 shrink-0 transition-all duration-300 cursor-pointer hover:bg-gray-50/50"
        onClick={() => navigate('/')}
      >
        {collapsed && !isMobile ? (
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={logoImg} alt="Logo" className="max-w-full max-h-full object-contain mix-blend-multiply" />
          </div>
        ) : (
          <div className="flex items-center gap-4 w-full justify-center">
            <img src={logoImg} alt="EBook Farm Logo" className="w-[65px] h-[65px] object-contain mix-blend-multiply" />
            <div className="flex flex-col text-center">
              <span className="text-green-600 font-bold text-[15px] leading-[1.2]">NHẬT KÝ SẢN XUẤT</span>
              <span className="text-green-600 font-bold text-[15px] leading-[1.2]">ĐIỆN TỬ</span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scroll transition-all duration-300">
        <Menu
          mode="inline"
          selectedKeys={[
            items.flatMap(item => item.children ? [item, ...item.children] : [item])
              .find(item => item.key && location.pathname.startsWith(item.key))?.key || location.pathname
          ]}
          defaultOpenKeys={[]}
          items={items}
          onClick={handleNavItemClick}
          className="border-r-0 px-3 py-4"
          expandIcon={({ isOpen }) => <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
        />
      </div>

      {/* Support Card - Pushed to bottom */}
      {(!collapsed || isMobile) && (
        <div className="p-6 mt-auto border-t border-gray-50 shrink-0 bg-white">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100 shadow-sm shadow-green-50/50">
            <Text strong className="text-green-800 text-xs block mb-1">Hỗ trợ kỹ thuật?</Text>
            <Text className="text-green-600 text-[10px] block mb-3">Liên hệ hotline: 0981.439.283</Text>
            <Button type="primary" size="small" block className="rounded-lg text-[10px] h-8 font-bold">Gửi yêu cầu</Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      {/* Sider for Desktop */}
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
        <Header className={`bg-white/80 backdrop-blur-md p-0 flex justify-between items-center z-10 sticky top-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-gray-50 ${isMobile ? 'px-4 h-16' : 'px-8 h-20'}`}>
          <Button
            type="text"
            icon={<MenuOutlined className="text-green-600 text-xl" />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className="w-10 h-10 flex items-center justify-center hover:bg-green-50 rounded-xl transition-all"
          />

          <div className="flex items-center gap-2 md:gap-6">
            <Space size={isMobile ? 8 : 16} className="mr-0 md:mr-4">
              <NotificationBell />
              {!isMobile && <Button type="text" icon={<SettingOutlined className="text-gray-400 text-lg" />} className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-50" />}
            </Space>

            {!isMobile && <div className="h-10 w-[1px] bg-gray-100"></div>}

            <Dropdown
              menu={{ items: dropdownItems, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={['click']}
              arrow={{ pointAtCenter: true }}
              classNames={{ root: 'premium-auth-dropdown' }}
            >
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer group hover:bg-green-50/50 p-1.5 md:pr-3 rounded-2xl transition-all border border-transparent hover:border-green-100">
                <Avatar
                  size={isMobile ? 32 : 44}
                  src={getAvatarUrl(user?.avatar)}
                  className="bg-green-50 text-green-600 border-2 border-green-200 group-hover:border-green-400 transition-all font-bold shadow-sm"
                >
                  {!user?.avatar && getInitialAvatar(user?.fullname || user?.username || 'U')}
                </Avatar>
                {!isMobile && (
                  <div className="text-left flex flex-col justify-center">
                    <Text className="font-bold text-gray-800 group-hover:text-green-600 transition-colors block text-sm leading-tight">{user?.fullname || user?.username || 'Thành viên'}</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role || 'Admin Account'}</Text>
                  </div>
                )}
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className={`${isMobile ? 'p-4' : 'p-8'} bg-[#f8fafc] min-h-[calc(100vh-80px)]`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
