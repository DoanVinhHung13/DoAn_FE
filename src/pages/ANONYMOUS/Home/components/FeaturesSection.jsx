import React from 'react'
import { Row, Col, Card, Typography, Tag } from 'antd'
import {
  EditOutlined,
  ThunderboltFilled,
  QrcodeOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  RocketOutlined,
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const features = [
  {
    title: 'Quản lý quy trình sản xuất chi tiết',
    desc: 'Ghi chép đầy đủ các hoạt động: gieo trồng, bón phân, tưới tiêu, thu hoạch. Tích hợp sổ tay điện tử thông minh cho từng loại cây trồng, vật nuôi.',
    icon: <EditOutlined />,
    color: '#10b981',
    bgImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    title: 'Tự động hóa & Đồng bộ dữ liệu',
    desc: 'Đồng bộ dữ liệu thời gian thực từ mọi thiết bị: Cảm biến IoT, Drone, Mobile, Tablet.',
    icon: <ThunderboltFilled />,
    color: '#3b82f6',
    bgImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  {
    title: 'Tem QR Truy xuất & Chống giả',
    desc: 'Cung cấp mã QR định danh độc bản cho từng lô sản phẩm. Giúp người tiêu dùng dễ dàng kiểm chứng hàng thật.',
    icon: <QrcodeOutlined />,
    color: '#059669',
    bgImage: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  },
  {
    title: 'Phân tích và dự báo AI',
    desc: 'Sử dụng AI phân tích dữ liệu để dự báo năng suất, chi phí và rủi ro.',
    icon: <LineChartOutlined />,
    color: '#8b5cf6',
    bgImage: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    title: 'Bảo mật và lưu trữ đám mây',
    desc: 'Lưu trữ dữ liệu trên nền tảng Cloud bảo mật tuyệt đối.',
    icon: <CloudServerOutlined />,
    color: '#06b6d4',
    bgImage: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
]

const FeaturesSection = () => {
  return (
    <section className="px-6 py-24 bg-slate-50 md:py-32">
      <div className="mx-auto space-y-20 max-w-7xl">
        <div className="max-w-3xl mx-auto space-y-4 text-center scroll-reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
              <RocketOutlined className="text-2xl text-green-600" />
            </div>
            <Tag color="green" className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge">
              Đặc điểm nổi bật
            </Tag>
          </div>
          <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">
            Nhật ký sản xuất điện tử EAPLS
          </Title>
          <Paragraph className="text-lg text-gray-500">
            Giải pháp chuyển đổi số toàn diện cho nông nghiệp hiện đại, minh bạch và hiệu quả.
          </Paragraph>
        </div>

        <div className="scroll-reveal w-full max-w-5xl mx-auto rounded-[40px] overflow-hidden shadow-2xl border-[8px] border-white/50 bg-white hover-lift relative group">
          <div className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>
          <img src="/images/smart_farming.png" alt="EAPLS Dashboard" className="w-full h-auto" />
        </div>

        <Row gutter={[20, 20]} className="mt-12">
          {features.map((item, idx) => (
            <Col xs={24} md={idx < 3 ? 8 : 12} key={idx}>
              <Card
                variant="borderless"
                className="h-full rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border-gray-100 group hover-lift scroll-reveal"
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-2xl"
                  style={{ background: item.bgImage }}
                ></div>

                <div
                  className="relative z-10 flex items-center justify-center w-16 h-16 mb-8 transition-transform transform shadow-xl rounded-2xl group-hover:rotate-12 rotate-hover"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <Title level={4} className="!mb-4 !text-gray-900 leading-tight">
                  {item.title}
                </Title>
                <Paragraph className="text-sm leading-relaxed text-gray-500">{item.desc}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}

export default FeaturesSection
