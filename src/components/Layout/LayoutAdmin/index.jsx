import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { AdminMenuStyled } from "./styled";
import { MenuItemAdmin } from "src/router/MenuItem";
import GlobalHeader from "src/components/Layout/Header";
import GlobalFooter from "src/components/Layout/Footer";

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Layout style={{ minHeight: "100vh" }}>
      {/* Remove role="admin" from GlobalHeader if we don't want the horizontal menu to duplicate the sidebar. 
          But the user specifically requested: "ở header sẽ có mục menu nếu Role nào thì sẽ được hiển thị menu theo Role của người đó".
          I will pass role="admin" as requested. */}
      <GlobalHeader role="admin" />
      
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
            {collapseMenu ? "Admin" : "Admin Panel"}
          </div>
          <Menu
            onClick={onChange}
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuAdmin}
            style={{ borderRight: "none" }}
          />
        </Sider>
        
        <Content
          style={{
            padding: "24px",
            backgroundColor: "#f3f4f6"
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      
      <GlobalFooter />
    </Layout>
  );
};

export default LayoutAdmin;
