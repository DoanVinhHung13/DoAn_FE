import React from 'react'
import { Row, Col, Card, Typography, Button, Tag, Divider } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { SafetyCertificateFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

const { Title, Paragraph, Text } = Typography

const TcvnSection = () => {
  const navigate = useNavigate()

  return (
    <section className="px-6 py-16 bg-white md:py-20">
      <div className="mx-auto max-w-7xl">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <div className="relative scroll-reveal">
              <div className="absolute -inset-10 bg-blue-100/30 blur-[100px] rounded-full blob-animate"></div>
              <Card
                variant="borderless"
                className="shadow-2xl rounded-[40px] p-6 border-gray-50 glass-card relative z-10 hover-lift"
              >
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-5 p-4 transition-all border border-transparent rounded-2xl hover:bg-white/80 hover:border-blue-50 hover-lift"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shrink-0">
                        <SafetyCertificateFilled className="text-xl text-white" />
                      </div>
                      <div className="flex-1">
                        <Text className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                          Tiêu chuẩn {i}
                        </Text>
                        <Text strong className="text-base text-gray-800 line-clamp-1">
                          {i === 1
                            ? 'TCVN 12827:2023 - Rau quả tươi'
                            : i === 2
                            ? 'TCVN 13166-4:2020 - Thịt lợn'
                            : 'TCVN 13840:2023 - Cà phê'}
                        </Text>
                      </div>
                      <ArrowRightOutlined className="text-gray-300" />
                    </div>
                  ))}
                  <Button
                    block
                    size="large"
                    className="font-bold text-blue-600 transition-all border-blue-100 h-14 rounded-xl hover:bg-blue-50 shine-effect"
                    onClick={() => navigate(ROUTER.TCVN)}
                  >
                    Tra cứu toàn bộ 35 tiêu chuẩn <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
          <Col xs={24} md={12} className="space-y-6 scroll-reveal">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
                <SafetyCertificateFilled className="text-2xl text-blue-600" />
              </div>
              <Tag
                color="blue"
                className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge"
              >
                Tuân thủ
              </Tag>
            </div>
            <Title className="!text-gray-900 !mb-6 leading-tight md:!text-5xl gradient-text">
              Gốc gác rõ ràng,
              <br />
              Niềm tin vững chắc.
            </Title>
            <Paragraph className="text-lg leading-relaxed text-gray-500">
              Hệ thống của chúng tôi được xây dựng dựa trên danh mục đầy đủ các tiêu chuẩn quốc gia về truy xuất nguồn gốc (TCVN). Giúp sản phẩm của bạn dễ dàng vượt qua các rào cản kỹ thuật và tiến xa ra thị trường quốc tế.
            </Paragraph>
            <Divider className="my-10" />
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2 count-up">
                <Text className="block text-4xl font-black text-blue-600">100%</Text>
                <Text className="font-medium text-gray-600">Phù hợp quy định nhà nước</Text>
              </div>
              <div className="space-y-2 count-up" style={{ animationDelay: '0.2s' }}>
                <Text className="block text-4xl font-black text-blue-600">24/7</Text>
                <Text className="font-medium text-gray-600">Tra cứu & Kiểm soát</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default TcvnSection
