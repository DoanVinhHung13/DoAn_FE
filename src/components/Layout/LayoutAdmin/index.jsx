import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import GlobalHeader from "src/components/Layout/Header";
import { MenuItemAdmin } from "src/router/MenuItem";

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
    <Layout style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Remove role="admin" from GlobalHeader if we don't want the horizontal menu to duplicate the sidebar. 
          But the user specifically requested: "ở header sẽ có mục menu nếu Role nào thì sẽ được hiển thị menu theo Role của người đó".
          I will pass role="admin" as requested. */}
      <GlobalHeader role="admin" />
      
      <Layout style={{ flex: 1, display: "flex" }}>
        <Sider
          collapsible
          collapsed={collapseMenu}
          onCollapse={(value) => setCollapseMenu(value)}
          theme="light"
          width={250}
          style={{ borderRight: "1px solid #e5e7eb" }}
        >
      
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
            backgroundColor: "#f3f4f6",
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
