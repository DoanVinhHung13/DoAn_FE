import React from "react";
import { Layout, Menu, Button, Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getMenuByRole } from "src/router/MenuItem";
import { ColorPrimary, ColorSecondary } from "src/theme/GlobalThemeConfig";
import authSession from "src/services/core/authSession";
import ROUTER from "src/router/ROUTER";

const { Header } = Layout;

const GlobalHeader = ({ role }) => {
  const navigate = useNavigate();
  // Ensure role is valid, fallback to empty array if no role
  const menuItems = role ? getMenuByRole(role) : getMenuByRole("anonymous");

  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    authSession.clearSession();
    localStorage.removeItem("mock_role");
    navigate(ROUTER.LOGIN);
  };

  const userDropdown = {
    items: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />,
        onClick: () => navigate(ROUTER.PROFILE)
      },
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout
      }
    ]
  };

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: ColorSecondary,
        padding: "0 24px",
        boxShadow: "0 2px 8px #f0f1f2",
        zIndex: 10,
        position: 'sticky',
        top: 0
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32, flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "20px",
            color: ColorPrimary,
            cursor: "pointer",
            marginRight: 24
          }}
          onClick={() => navigate(ROUTER.HOME)}
        >
          EbookFarm
        </div>
        
        <Menu
          mode="horizontal"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            flex: 1, 
            minWidth: 0, 
            background: "transparent",
            borderBottom: 'none'
          }}
        />
      </div>

      <div>
        {role ? (
          <Dropdown menu={userDropdown} placement="bottomRight">
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar style={{ backgroundColor: ColorPrimary }} icon={<UserOutlined />} />
              <span style={{ fontWeight: 500 }}>{role === 'admin' ? 'Admin User' : 'Farmer User'}</span>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" onClick={() => navigate(ROUTER.LOGIN)} style={{ background: ColorPrimary }}>
            Login
          </Button>
        )}
      </div>
    </Header>
  );
};

export default GlobalHeader;
