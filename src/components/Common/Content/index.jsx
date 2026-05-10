import { Breadcrumb, Layout, theme } from "antd";
import React from "react";

const { Content } = Layout;

const contentStyle = {
  // textAlign: "center",
  // lineHeight: "120px",
  // color: "#fff",
  // backgroundColor: "#0958d9",
  height: "100%",
  margin: "0 16px",
};
const ContentMain = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Content style={contentStyle}>
      <Breadcrumb
        style={{ margin: "16px 0" }}
        items={[
          {
            title: "Home",
          },
          {
            title: <a href="">Application Center</a>,
          },
          {
            title: <a href="">Application List</a>,
          },
          {
            title: "An Application",
          },
        ]}
      />
      <div
        style={{
          padding: 24,
          minHeight: 360,
          height: "calc(-163px + 100vh)",
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        {children}
      </div>
      <div className="d-flex-center mt-8" style={{ height: "35px" }}>
        <div className="text-center ">© Power by H2Q solution</div>
      </div>
    </Content>
  );
};

export default ContentMain;
