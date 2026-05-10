import { Layout, Menu } from "antd";
import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import GlobalHeader from "src/components/Layout/Header";
import { StoreContext } from "src/contexts";
import { MenuItemAdmin } from "src/router/MenuItem";

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeStore } = useContext(StoreContext);
  const { isDarkMode } = themeStore;
  const [selectedKey, setSelectedKey] = useState(location?.pathname);
  const [collapseMenu, setCollapseMenu] = useState(false);

  const menuAdmin = MenuItemAdmin();

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
      {/* Remove role="admin" from GlobalHeader if we don't want the horizontal menu to duplicate the sidebar. 
          But the user specifically requested: "ở header sẽ có mục menu nếu Role nào thì sẽ được hiển thị menu theo Role của người đó".
          I will pass role="admin" as requested. */}
      <GlobalHeader role="admin" />
      
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
      
          <Menu
            onClick={onChange}
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuAdmin}
            theme={isDarkMode ? "dark" : "light"}
            style={{
              borderRight: "none",
              backgroundColor: isDarkMode ? "#111827" : "#ffffff",
            }}
          />
        </Sider>
        
        <Content
          style={{
            padding: "24px",
            backgroundColor: isDarkMode ? "#0f172a" : "#f3f4f6",
            flex: 1,
            minHeight: "calc(100vh - 64px - 220px)"
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      
      {/* <GlobalFooter /> */}
    </Layout>
  );
};

export default LayoutAdmin;
