import React from 'react'
import { Card, Typography, Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ROUTER from 'src/router/ROUTER'

const { Title, Paragraph, Text } = Typography

const modules = [
  {
    id: 'txng',
    tag: 'Dành cho người dùng & người tiêu dùng',
    title: 'Cổng Tra cứu & Truy xuất QR',
    desc: 'Nền tảng tra cứu minh bạch phục vụ người tiêu dùng. Quét mã QR trên tem nông sản để xem toàn bộ thông tin nguồn gốc, lô thu hoạch, nhật ký canh tác thực địa và chứng nhận an toàn.',
    btnLabel: 'Tra cứu thông tin',
    bgColor: '#2e7d32',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=70',
    action: 'trace',
  },
  {
    id: 'mgmt',
    tag: 'Dành cho trang trại, HTX & doanh nghiệp',
    title: 'Hệ thống Quản trị & Nhật ký Điện tử',
    desc: 'Phần mềm chuyển đổi số nông nghiệp toàn diện. Hỗ trợ chủ trang trại và nhân sự quản lý vùng trồng, lập quy trình canh tác, số hóa ghi chép bón phân/nông dược và cấp phát tem QR.',
    btnLabel: 'Truy cập Quản trị',
    bgColor: '#01579b',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=70',
    action: 'login',
  },
]

const FeaturesSection = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)

  const handleAction = (action) => {
    if (action === 'login') {
      navigate(user ? ROUTER.FM_DASHBOARD : ROUTER.LOGIN)
    } else {
      // Scroll to QR lookup section or navigate
      const element = document.getElementById('qr-lookup-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="py-16 px-6 bg-white">
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
            Các hợp phần chính của hệ thống
          </h2>
          <p style={{ color: '#616161', fontSize: '0.95rem', maxWidth: 540, margin: '0 auto' }}>
            Hai giải pháp cốt lõi phục vụ minh bạch nguồn gốc cho người tiêu dùng và số hóa quản lý cho trang trại
          </p>
        </div>

        {/* 2 Module Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              style={{
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              styles={{ body: { padding: 0 } }}
              className="hover-lift"
            >
              {/* Header màu */}
              <div
                style={{
                  background: mod.bgColor,
                  padding: '28px 28px 20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Ảnh nền mờ */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${mod.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '2px 10px',
                      borderRadius: 4,
                      marginBottom: 12,
                    }}
                  >
                    {mod.tag}
                  </span>
                  <Title
                    level={3}
                    style={{
                      color: '#fff',
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {mod.title}
                  </Title>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 28px 24px' }}>
                <Paragraph
                  style={{
                    color: '#616161',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  {mod.desc}
                </Paragraph>
                <Button
                  onClick={() => handleAction(mod.action)}
                  style={{
                    borderColor: mod.bgColor,
                    color: mod.bgColor,
                    fontWeight: 600,
                    borderRadius: 6,
                    fontSize: '0.88rem',
                  }}
                >
                  {mod.btnLabel} <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
