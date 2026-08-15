import React from 'react'
import { Button, Space } from 'antd'
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ROUTER from 'src/router/ROUTER'

const HeroSection = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)

  const handleGetStarted = () => navigate(user ? ROUTER.FM_DASHBOARD : ROUTER.LOGIN)

  return (
    <section className="relative overflow-hidden" style={{ minHeight: 500 }}>
      {/* Background: ảnh nông nghiệp + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(27, 94, 32, 0.88) 0%, rgba(1, 87, 155, 0.75) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="flex flex-col md:flex-row md:items-center gap-10">

          {/* Trái: Text content */}
          <div style={{ flex: 1, maxWidth: 600 }}>
            {/* Label */}
            <div
              className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#a5d6a7' }}
              >
                Hệ thống truy xuất nguồn gốc canh tác nông sản
              </span>
            </div>

            {/* Tiêu đề */}
            <h1
              className="font-bold leading-tight mb-4"
              style={{
                color: '#fff',
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                lineHeight: 1.2,
              }}
            >
              Minh bạch canh tác,
              <br />
              chuyển đổi số nông nghiệp
            </h1>

            {/* Mô tả */}
            <p
              className="mb-8 leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '1.05rem',
                maxWidth: 520,
              }}
            >
              Nền tảng EAPLS giúp nông trại và hợp tác xã số hóa quy trình sản xuất: từ ghi chép nhật ký canh tác, quản lý vật tư bón phân/nông dược đến quản lý lô thu hoạch và phát hành tem QR truy xuất nguồn gốc.
            </p>

            {/* Nút */}
            <Space size={12} wrap>
              <Button
                type="primary"
                size="large"
                onClick={handleGetStarted}
                style={{
                  background: '#2e7d32',
                  borderColor: '#2e7d32',
                  height: 48,
                  paddingInline: 28,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  borderRadius: 6,
                }}
              >
                Bắt đầu sử dụng <ArrowRightOutlined />
              </Button>
            </Space>

            {/* Thống kê */}
            <div
              className="flex flex-wrap gap-8 mt-12 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}
            >
              {[
                { value: '100%', label: 'Số hóa nhật ký canh tác' },
                { value: '03', label: 'Cấp phân quyền vận hành' },
                { value: 'QR Code', label: 'Truy xuất lô thu hoạch' },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ color: '#a5d6a7', fontSize: '1.5rem', fontWeight: 700 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phải: QR Demo card — bán trong suốt */}
          <div className="hidden md:flex flex-col items-center" style={{ flexShrink: 0 }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 12,
                padding: '20px 24px',
                textAlign: 'center',
                minWidth: 200,
              }}
            >
              {/* Header card */}
              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#a5d6a7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                📦 Sản phẩm mẫu
              </div>

              {/* QR Image — nền trắng nhỏ để QR dễ scan */}
              <div
                style={{
                  display: 'inline-block',
                  padding: 8,
                  borderRadius: 8,
                  background: '#fff',
                  marginBottom: 12,
                }}
              >
                <img
                  src="/qr_hong_nam_dong.png"
                  alt="QR Cây Hồng Nam Đồng"
                  style={{ width: 130, height: 130, display: 'block' }}
                />
              </div>

              {/* Tên sản phẩm */}
              <div
                style={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '0.9rem',
                  marginBottom: 4,
                }}
              >
                🌿 Cây Hồng Nam Đồng
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Quét để xem nguồn gốc sản phẩm
              </div>

              {/* Indicator */}
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(165,214,167,0.2)',
                  border: '1px solid rgba(165,214,167,0.4)',
                  borderRadius: 4,
                  padding: '3px 10px',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#a5d6a7', display: 'inline-block',
                }} />
                <span style={{ fontSize: '0.68rem', color: '#a5d6a7', fontWeight: 600 }}>
                  Đã xác thực
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}

export default HeroSection
