import React from "react"
import { Row, Col, Typography, Tag } from "antd"
import {
  FileTextOutlined,
  CloudServerOutlined,
  ShareAltOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons"
const { Title, Text, Paragraph } = Typography

const technologies = [
  {
    icon: <FileTextOutlined />,
    label: "Ghi nhận",
    desc: "Dữ liệu thực địa",
  },
  {
    icon: <CloudServerOutlined />,
    label: "Lưu trữ",
    desc: "Database/Cloud",
  },
  {
    icon: <ShareAltOutlined />,
    label: "Chia sẻ",
    desc: "Đa nền tảng",
  },
  {
    icon: <SecurityScanOutlined />,
    label: "Kiểm chứng",
    desc: "Xác thực QR",
  },
]

const TechSection = () => {
  return (
    <section
      data-technology-count={technologies.length}
      className="relative px-6 py-16 overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 md:py-20"
    >
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-200/30 blur-[100px] rounded-full blob-animate"></div>
      <div
        className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-200/30 blur-[100px] rounded-full blob-animate"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto mb-12 space-y-4 text-center scroll-reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
              <FileTextOutlined className="text-2xl text-blue-600" />
            </div>
            <Tag
              color="blue"
              className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge"
            >
              Công nghệ
            </Tag>
          </div>
          <Title
            level={2}
            className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text"
          >
            Công nghệ & Tiêu chuẩn
          </Title>
          <Paragraph className="text-lg text-gray-500">
            Đảm bảo tuân thủ các tiêu chuẩn quốc gia và quốc tế
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="space-y-6 scroll-reveal">
              {[
                {
                  icon: <FileTextOutlined />,
                  title: "Công nghệ Blockchain",
                  desc: "Sử dụng thuật toán blockchain đảm bảo minh bạch tuyệt đối, dữ liệu không thể thay đổi.",
                },
                {
                  icon: <CloudServerOutlined />,
                  title: "Tiêu chuẩn TCVN Quốc gia",
                  desc: "Hệ thống được xây dựng theo 35+ tiêu chuẩn TCVN về truy xuất nguồn gốc.",
                },
                {
                  icon: <ShareAltOutlined />,
                  title: "Chuẩn GS1 toàn cầu",
                  desc: "Tương thích với chuẩn GS1, dễ dàng tích hợp với hệ thống quốc tế.",
                },
                {
                  icon: <SecurityScanOutlined />,
                  title: "Tích hợp Cổng TXNG Quốc gia",
                  desc: "Đồng bộ dữ liệu với Cổng Truy xuất nguồn gốc Quốc gia của Bộ Khoa học.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-6 transition-all bg-white shadow-sm rounded-2xl hover:shadow-lg hover-lift"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 text-blue-600 rounded-xl bg-blue-50 shrink-0 pulse-glow">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <Title level={5} className="!mb-0 !text-gray-900">
                      {item.title}
                    </Title>
                    <Text className="text-sm text-gray-500">{item.desc}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} md={12} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-3xl rounded-[50px] -z-10"></div>
            <img
              src="/images/tcvn_cert.png"
              alt="Chứng nhận tiêu chuẩn TCVN"
              className="w-full rounded-[40px] shadow-2xl scroll-reveal hover-lift object-cover h-[450px]"
            />
            <div className="absolute p-4 border-white shadow-xl bottom-8 right-8 bg-white/90 backdrop-blur rounded-2xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <Text strong className="block text-gray-900">
                    Đạt chuẩn VietGAP
                  </Text>
                  <Text className="text-xs text-gray-500">100% minh bạch</Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default TechSection
