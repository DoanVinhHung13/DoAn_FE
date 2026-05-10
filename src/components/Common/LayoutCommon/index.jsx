import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import GlobalHeader from "src/components/Layout/Header";
import GlobalFooter from "src/components/Layout/Footer";
import { StoreContext } from "src/contexts";

const { Content } = Layout;

const LayoutCommon = ({ children }) => {
  const { themeStore } = useContext(StoreContext);
  const { isDarkMode } = themeStore;
  const role = localStorage.getItem("mock_role") || null;

  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
      }}
    >
      <GlobalHeader role={role} />

      <Content
        style={{
          flex: 1,
          minHeight: "calc(100vh - 64px - 220px)",
          padding: "24px",
          backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
        }}
      >
        {children || <Outlet />}
      </Content>

      <GlobalFooter />
    </Layout>
  );
};

export default LayoutCommon;
