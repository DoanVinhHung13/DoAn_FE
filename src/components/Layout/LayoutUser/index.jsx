import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { MenuItemUser } from "src/router/MenuItem";
import GlobalHeader from "src/components/Layout/Header";
import GlobalFooter from "src/components/Layout/Footer";

const { Content, Sider } = Layout;

const LayoutUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Layout style={{ minHeight: "100vh" }}>
      <GlobalHeader role="user" />
      
      <Layout>
        <Sider
          collapsible
          collapsed={collapseMenu}
          onCollapse={(value) => setCollapseMenu(value)}
          theme="light"
          width={250}
          style={{ borderRight: "1px solid #e5e7eb" }}
        >
          <div style={{ padding: "16px", textAlign: "center", fontWeight: "bold", fontSize: collapseMenu ? "12px" : "18px" }}>
            {collapseMenu ? "User" : "Farmer Dashboard"}
          </div>
          <Menu
            onClick={onChange}
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuUser}
            style={{ borderRight: "none", height: "100%" }}
          />
        </Sider>
        
        <Content
          style={{
            padding: "24px",
            backgroundColor: "#f9f9f9"
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
