import React from 'react'
import { Row, Col, Typography } from 'antd'
import {
  TrophyOutlined,
  LineChartOutlined,
  SafetyOutlined,
  GlobalOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const benefits = [
  {
    icon: <TrophyOutlined />,
    title: 'Tạo ưu thế cạnh tranh',
    desc: 'Áp dụng truy xuất nguồn gốc giúp tăng cơ hội đàm phán và bán được giá tốt hơn trên thị trường.',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Tối ưu quy trình sản xuất',
    desc: 'Quản lý hiệu quả vùng sản xuất, kiểm soát rủi ro, tối ưu nhân sự và chi phí vận hành.',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Chống hàng giả & Bảo vệ thương hiệu',
    desc: 'Hệ thống tem QR định danh độc bản giúp ngăn chặn hàng nhái, bảo vệ uy tín thương hiệu.',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Mở rộng thị trường xuất khẩu',
    desc: 'Đáp ứng đầy đủ các tiêu chuẩn khắt khe quốc tế, dễ dàng tiếp cận thị trường nước ngoài.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Minh bạch chuỗi cung ứng',
    desc: 'Hỗ trợ minh bạch toàn bộ hoạt động sản xuất để chứng minh năng lực thực tế của doanh nghiệp.',
  },
  {
    icon: <DollarOutlined />,
    title: 'Tăng doanh thu bền vững',
    desc: 'Quảng bá thông tin sản phẩm chuyên nghiệp, tăng độ nhận diện thương hiệu và doanh số.',
  },
]

const BenefitsSection = () => {
  return (
    <section className="py-16 px-6" style={{ background: '#f5f5f5' }}>
      <div className="mx-auto max-w-6xl">
        {/* Tiêu đề */}
        <div className="text-center mb-12">
          <h2
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: 8,
            }}
          >
            Giá trị mà doanh nghiệp nhận được
          </h2>
          <p style={{ color: '#616161', fontSize: '0.95rem' }}>
            Khi triển khai hệ thống truy xuất nguồn gốc với EAPLS
          </p>
        </div>

        <Row gutter={[20, 20]}>
          {benefits.map((item, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: '24px 20px',
                  height: '100%',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'default',
                }}
                className="benefit-card"
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: '#e8f5e9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2e7d32',
                    fontSize: 20,
                    marginBottom: 14,
                  }}
                >
                  {item.icon}
                </div>

                <Title
                  level={5}
                  style={{
                    color: '#212121',
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  {item.title}
                </Title>
                <Paragraph
                  style={{
                    color: '#757575',
                    fontSize: '0.85rem',
                    lineHeight: 1.65,
                    marginBottom: 0,
                  }}
                >
                  {item.desc}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <style>{`
        .benefit-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border-color: #c8e6c9;
        }
      `}</style>
    </section>
  )
}

export default BenefitsSection
