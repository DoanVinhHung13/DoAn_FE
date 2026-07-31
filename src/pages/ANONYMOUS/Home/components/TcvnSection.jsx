import React from 'react'
import { Row, Col, Button, Typography, Divider } from 'antd'
import { ArrowRightOutlined, SafetyCertificateFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

const { Title, Paragraph, Text } = Typography

const tcvnList = [
  'TCVN 12827:2023 — Rau quả tươi: Truy xuất nguồn gốc',
  'TCVN 13166-4:2020 — Thịt lợn: Yêu cầu truy xuất',
  'TCVN 13840:2023 — Cà phê: Truy xuất nguồn gốc',
]

const TcvnSection = () => {
  const navigate = useNavigate()

  return (
    <section className="py-16 px-6 bg-white">
      <div className="mx-auto max-w-6xl">
        <Row gutter={[48, 48]} align="middle">
          {/* Trái: Danh sách TCVN */}
          <Col xs={24} md={12}>
            <div
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: '#01579b',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <SafetyCertificateFilled style={{ color: '#fff', fontSize: 18 }} />
                <Text style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                  Danh mục Tiêu chuẩn Quốc gia (TCVN)
                </Text>
              </div>

              {/* Danh sách */}
              <div style={{ background: '#fff' }}>
                {tcvnList.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 20px',
                      borderBottom: i < tcvnList.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    className="tcvn-item"
                    onClick={() => navigate(ROUTER.TCVN)}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        background: '#e3f2fd',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <SafetyCertificateFilled style={{ color: '#01579b', fontSize: 14 }} />
                    </div>
                    <Text style={{ fontSize: '0.88rem', color: '#424242', flex: 1 }}>
                      {item}
                    </Text>
                    <ArrowRightOutlined style={{ color: '#bdbdbd', fontSize: 12 }} />
                  </div>
                ))}

                {/* Nút tra cứu */}
                <div style={{ padding: '14px 20px' }}>
                  <Button
                    block
                    onClick={() => navigate(ROUTER.TCVN)}
                    style={{
                      borderColor: '#01579b',
                      color: '#01579b',
                      borderRadius: 6,
                      fontWeight: 600,
                      height: 40,
                    }}
                  >
                    Tra cứu toàn bộ 35 tiêu chuẩn <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </div>
          </Col>

          {/* Phải: Nội dung giải thích */}
          <Col xs={24} md={12}>
            <div style={{ paddingLeft: 8 }}>
              <div
                className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded"
                style={{
                  background: '#e3f2fd',
                  border: '1px solid #bbdefb',
                }}
              >
                <SafetyCertificateFilled style={{ color: '#01579b', fontSize: 14 }} />
                <Text
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#01579b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Tuân thủ tiêu chuẩn quốc gia
                </Text>
              </div>

              <Title
                level={2}
                style={{
                  color: '#1a1a1a',
                  fontWeight: 700,
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  marginBottom: 16,
                  lineHeight: 1.3,
                }}
              >
                Gốc gác rõ ràng,
                <br />
                Niềm tin vững chắc.
              </Title>

              <Paragraph style={{ color: '#616161', fontSize: '0.95rem', lineHeight: 1.75 }}>
                Hệ thống được xây dựng dựa trên danh mục đầy đủ các tiêu chuẩn quốc gia về truy
                xuất nguồn gốc (TCVN). Giúp sản phẩm của bạn dễ dàng vượt qua các rào cản kỹ
                thuật và tiến xa ra thị trường quốc tế.
              </Paragraph>

              <Divider style={{ margin: '20px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {[
                  { value: '100%', label: 'Phù hợp quy định nhà nước' },
                  { value: '24/7', label: 'Tra cứu & Kiểm soát' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#01579b' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#757575', marginTop: 4 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>{`
        .tcvn-item:hover {
          background: #f5f5f5;
        }
      `}</style>
    </section>
  )
}

export default TcvnSection
