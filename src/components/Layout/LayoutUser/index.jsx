import { Layout, Menu } from "antd";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { StoreContext } from "src/contexts";
import { MenuItemUser } from "src/router/MenuItem";
import GlobalHeader from "src/components/Layout/Header";
import GlobalFooter from "src/components/Layout/Footer";

const { Content, Sider } = Layout;

const LayoutUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeStore } = useContext(StoreContext);
  const { isDarkMode } = themeStore;
  const [selectedKey, setSelectedKey] = useState(location?.pathname);
  const [collapseMenu, setCollapseMenu] = useState(false);

  const menuUser = MenuItemUser();

  const onChange = (menu) => {
    !menu?.key?.includes("subkey") && navigate(menu?.key?.replace("submenu", ""));
  };

  useEffect(() => {
    setSelectedKey(location?.pathname);
  }, [location?.pathname]);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
      }}
    >
      <GlobalHeader role="user" />
      
      <Layout style={{ flex: 1, display: "flex", backgroundColor: "transparent" }}>
        <Sider
          collapsible
          collapsed={collapseMenu}
          onCollapse={(value) => setCollapseMenu(value)}
          theme={isDarkMode ? "dark" : "light"}
          width={250}
          style={{
            borderRight: `1px solid ${isDarkMode ? "#1f2937" : "#e5e7eb"}`,
            backgroundColor: isDarkMode ? "#111827" : "#ffffff",
          }}
        >
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: collapseMenu ? "12px" : "18px",
              color: isDarkMode ? "#e5e7eb" : "#111827",
            }}
          >
            {collapseMenu ? "User" : "Farmer Dashboard"}
          </div>
          <Menu
            onClick={onChange}
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuUser}
            theme={isDarkMode ? "dark" : "light"}
            style={{
              borderRight: "none",
              height: "100%",
              backgroundColor: isDarkMode ? "#111827" : "#ffffff",
            }}
          />
        </Sider>
        
        <Content
          style={{
            padding: "24px",
            backgroundColor: isDarkMode ? "#0f172a" : "#f9f9f9",
            flex: 1,
            minHeight: "calc(100vh - 64px - 220px)"
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <GlobalFooter />
    </Layout>
  );
};

export default LayoutUser;
