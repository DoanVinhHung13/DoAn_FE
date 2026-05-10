import React from "react";
import { Layout, Typography, Row, Col } from "antd";
import { ColorPrimary } from "src/theme/GlobalThemeConfig";

const { Footer } = Layout;
const { Text, Title } = Typography;

const GlobalFooter = () => {
  return (
    <Footer style={{ background: "#1f2937", color: "#f3f4f6", padding: "48px 24px" }}>
      <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ color: ColorPrimary, margin: 0 }}>EbookFarm</Title>
          <p style={{ marginTop: 16, color: "#9ca3af" }}>
            The leading electronic agricultural journal system. Manage your farm smartly, trace production processes, and optimize your harvest.
          </p>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Title level={5} style={{ color: "#fff" }}>Quick Links</Title>
          <ul style={{ listStyleType: "none", padding: 0, marginTop: 16, color: "#9ca3af", lineHeight: "2" }}>
            <li><a href="/" style={{ color: "inherit" }}>Home</a></li>
            <li><a href="/about" style={{ color: "inherit" }}>About Us</a></li>
            <li><a href="/news" style={{ color: "inherit" }}>Agricultural News</a></li>
            <li><a href="/contact" style={{ color: "inherit" }}>Contact</a></li>
          </ul>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Title level={5} style={{ color: "#fff" }}>Contact Info</Title>
          <div style={{ marginTop: 16, color: "#9ca3af", lineHeight: "2" }}>
            <p style={{ margin: 0 }}>📍 123 Farming Avenue, Agrotech City</p>
            <p style={{ margin: 0 }}>📞 +84 123 456 789</p>
            <p style={{ margin: 0 }}>✉️ support@ebookfarm.com</p>
          </div>
        </Col>
      </Row>
      <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid #374151", color: "#9ca3af" }}>
        &copy; {new Date().getFullYear()} EbookFarm. All Rights Reserved.
      </div>
    </Footer>
  );
};

export default GlobalFooter;
