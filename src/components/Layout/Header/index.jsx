import {
  DashboardOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Divider as AntdDivider,
  Avatar,
  Button,
  Drawer,
  Dropdown,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "src/assets/images/logo/logo-ebookfarm.jpg";
import { clearAuthStorage } from "src/redux/storage";
import { getAvatarUrl } from "src/utils/helpers";
import { useAppDispatch } from "src/redux/hooks";
import { setUserInfo } from "src/redux/slices/appGlobalSlice";
import ROUTER from "src/router/ROUTER";

const { Title } = Typography;

const PublicNavbar = () => {
  const navigate = useNavigate();
  // Dùng Redux làm nguồn duy nhất — không cần isLoginContext từ Context
  const { userInfo: user } = useSelector((state) => state.appGlobal);
  const isLoginContext = Boolean(user?._id);
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuthStorage();
    dispatch(setUserInfo({}));
    navigate(ROUTER.HOME);
  };

  const userMenuItems = [
    {
      key: "dashboard",
      label: "Bảng điều khiển",
      icon: <DashboardOutlined />,
      onClick: () => navigate(ROUTER.FM_DASHBOARD),
    },
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <UserOutlined />,
      onClick: () => navigate(ROUTER.ACCOUNT_INFO),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="fixed top-0 z-50 flex justify-center w-full border-b border-gray-100 glass-card">
      <div className="flex items-center justify-between w-full px-6 py-4 max-w-7xl md:px-12">
        {/* Left Side: Logo */}
        <div className="flex justify-start flex-1">
          <div
            className="flex items-center gap-3 transition-opacity cursor-pointer hover:opacity-80"
            onClick={() => navigate(ROUTER.HOME)}
          >
            <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white border rounded-full shadow-sm border-gray-50">
              <img
                src={logo}
                alt="EBookFarm Logo"
                className="w-[140%] h-[140%] object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">
                Nhật ký sản xuất
              </span>
              <span className="text-green-600 font-extrabold text-[18px] leading-[1.1] uppercase tracking-tight">
                Điện tử
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Menu */}
        <div className="items-center justify-center hidden lg:flex">
          <Space size="large">
            <Button
              type="text"
              className="px-4 py-2 font-bold text-gray-600 transition-all hover:text-green-600 rounded-xl"
              onClick={() => navigate(ROUTER.HOME)}
            >
              Trang chủ
            </Button>
            <Button
              type="text"
              className="px-4 py-2 font-bold text-gray-600 transition-all hover:text-green-600 rounded-xl"
              onClick={() => navigate(ROUTER.TCVN)}
            >
              Tra cứu TCVN
            </Button>
            <Button
              type="text"
              className="px-4 py-2 font-bold text-gray-600 transition-all hover:text-green-600 rounded-xl"
              onClick={() => navigate(ROUTER.NEWS)}
            >
              Tin tức
            </Button>
            <Button
              type="text"
              className="px-4 py-2 font-bold text-gray-600 transition-all hover:text-green-600 rounded-xl"
              onClick={() => {
                if (window.location.pathname === ROUTER.HOME) {
                  document
                    .getElementById("about-us")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate(ROUTER.HOME);
                  setTimeout(
                    () =>
                      document
                        .getElementById("about-us")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    300,
                  );
                }
              }}
            >
              Về chúng tôi
            </Button>
          </Space>
        </div>

        {/* Right Side: Auth & Mobile Menu */}
        <div className="flex items-center justify-end flex-1">
          <Space size={0} className="flex items-center">
            {isLoginContext ? (
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={<DashboardOutlined />}
                  className="items-center hidden px-3 font-bold text-green-600 transition-all rounded-lg hover:bg-green-50 sm:flex"
                  onClick={() => navigate(ROUTER.FM_DASHBOARD)}
                >
                  Bảng điều khiển
                </Button>

                <AntdDivider
                  type="vertical"
                  className="hidden h-8 mx-4 border-gray-100 sm:block"
                />

                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                  arrow
                >
                  <div className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-50/80 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                    <Avatar
                      size={40}
                      src={getAvatarUrl(user?.avatarUrl)}
                      style={{ backgroundColor: "#16a34a" }}
                      icon={!user?.avatarUrl && <UserOutlined />}
                      className="border-2 border-white shadow-sm"
                    />
                    <div className="hidden md:flex flex-col justify-center min-w-[80px]">
                      <span className="text-[10px] text-gray-400 font-black uppercase leading-none tracking-widest mb-0.5">
                        Xin chào
                      </span>
                      <span className="text-[14px] text-gray-800 font-extrabold leading-none truncate">
                        {user?.fullName ||
                          user?.email?.split("@")[0] ||
                          "Người dùng"}
                      </span>
                    </div>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <Space size="small">
                <Button
                  type="text"
                  className="px-2 font-bold text-green-600 rounded-full"
                  onClick={() => navigate(ROUTER.LOGIN)}
                >
                  Đăng nhập
                </Button>
                {/* <Button
                  type="primary"
                  size="large"
                  className="px-4 font-bold bg-green-600 border-0 rounded-full shadow-lg hover:bg-green-700 md:px-6 shadow-green-100"
                  onClick={() => navigate(ROUTER.REGISTER)}
                >
                  Đăng ký
                </Button> */}
              </Space>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="ml-2 text-xl text-gray-600 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            />
          </Space>
        </div>

        {/* Mobile Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="object-contain w-8 h-8" />
              <span className="text-sm font-black text-green-600 uppercase">
                EBookFarm
              </span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
        >
          <div className="flex flex-col gap-4">
            <Button
              type="text"
              className="font-bold text-left text-gray-600"
              onClick={() => {
                navigate(ROUTER.HOME);
                setMobileMenuOpen(false);
              }}
            >
              Trang chủ
            </Button>
            <Button
              type="text"
              className="font-bold text-left text-gray-600"
              onClick={() => {
                navigate(ROUTER.TCVN);
                setMobileMenuOpen(false);
              }}
            >
              Tra cứu TCVN
            </Button>
            <Button
              type="text"
              className="font-bold text-left text-gray-600"
              onClick={() => {
                navigate(ROUTER.NEWS);
                setMobileMenuOpen(false);
              }}
            >
              Tin tức
            </Button>
            <Button
              type="text"
              className="font-bold text-left text-gray-600"
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === ROUTER.HOME) {
                  document
                    .getElementById("about-us")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate(ROUTER.HOME);
                  setTimeout(
                    () =>
                      document
                        .getElementById("about-us")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    300,
                  );
                }
              }}
            >
              Về chúng tôi
            </Button>

            <AntdDivider className="my-2" />

            {/* {!isLoginContext && (
              <Button
                type="primary"
                className="h-12 font-bold bg-green-600 border-0 rounded-xl"
                onClick={() => {
                  navigate(ROUTER.REGISTER);
                  setMobileMenuOpen(false);
                }}
              >
                Đăng ký
              </Button>
            )} */}
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default PublicNavbar;
