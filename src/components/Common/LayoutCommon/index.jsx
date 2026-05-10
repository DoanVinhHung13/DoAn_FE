import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import GlobalHeader from "src/components/Layout/Header";
import GlobalFooter from "src/components/Layout/Footer";

const { Content } = Layout;

const LayoutCommon = ({ children }) => {
  // Try to get role from localStorage if logged in, otherwise anonymous
  const role = localStorage.getItem("mock_role") || null;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <GlobalHeader role={role} />
      
      <Content style={{ minHeight: "calc(100vh - 64px - 300px)", padding: "24px" }}>
        {children || <Outlet />}
      </Content>

      <GlobalFooter />
    </Layout>
  );
};

export default LayoutCommon;
