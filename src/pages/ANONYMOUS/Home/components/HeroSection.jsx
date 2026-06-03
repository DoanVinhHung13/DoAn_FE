import React from 'react'
import { Col, Row, Typography, Button, Space, Tag } from 'antd'
import { ArrowRightOutlined, SearchOutlined, CheckCircleFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ROUTER from 'src/router/ROUTER'

const { Title, Paragraph, Text } = Typography

const HeroSection = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)

  const handleGetStarted = () => {
    if (user) {
      navigate(ROUTER.FM_DASHBOARD)
    } else {
      navigate(ROUTER.LOGIN)
    }
  }

  return (
    <section className="relative px-6 pt-32 pb-20 overflow-hidden md:pt-48 md:pb-32 hero-mask bg-slate-50">
      <div className="absolute top-0 right-0 z-0 w-full h-full opacity-20">
        <img
          src="/images/hero.png"
          alt="Agriculture Background"
          className="object-cover w-full h-full parallax-slow"
        />
      </div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-400/20 blur-[120px] rounded-full blob-animate"></div>
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 blur-[120px] rounded-full blob-animate"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={14} className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-4 scroll-reveal pulse-badge">
              <Tag color="green" className="m-0 font-bold rounded-full">
                Mới
              </Tag>
              <Text className="text-xs font-bold tracking-wider text-green-700 uppercase">
                Hệ thống truy xuất chuẩn quốc gia TCVN
              </Text>
            </div>
            <Title className="!text-gray-900 !mb-6 leading-[1.1] !text-4xl md:!text-7xl font-black scroll-reveal">
              Minh bạch <span className="gradient-text">Nguồn gốc</span>,
              <br />
              Nâng tầm <span className="gradient-text">Giá trị</span> Nông sản.
            </Title>
            <Paragraph className="max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl scroll-reveal">
              EBookFarm cung cấp giải pháp chuyển đổi số toàn diện cho nông trại, HTX và doanh nghiệp: Từ Nhật ký sản xuất điện tử đến Truy xuất nguồn gốc bằng mã QR chuẩn quốc gia.
            </Paragraph>
            <Space size="middle" className="flex-wrap pt-4 scroll-reveal">
              <Button
                type="primary"
                size="large"
                className="h-16 px-10 text-lg font-black bg-green-600 border-0 shadow-2xl hover:bg-green-700 rounded-2xl shadow-green-200 shine-effect hover-lift"
                onClick={handleGetStarted}
              >
                Số hóa nông trại ngay <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                className="h-16 px-10 text-lg font-bold transition-all border-2 border-gray-100 shadow-sm rounded-2xl hover:border-green-500 hover:text-green-600 hover-lift"
                onClick={() => navigate('/reference/tcvn')}
              >
                Tra cứu tiêu chuẩn <SearchOutlined />
              </Button>
            </Space>
            <div className="flex flex-wrap items-center pt-12 gap-x-12 gap-y-6 scroll-reveal">
              <div className="flex flex-col count-up">
                <span className="text-3xl font-black text-gray-900">500+</span>
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Nông trại</span>
              </div>
              <div className="flex flex-col count-up" style={{ animationDelay: '0.2s' }}>
                <span className="text-3xl font-black text-gray-900">35+</span>
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tiêu chuẩn TCVN</span>
              </div>
              <div className="flex flex-col count-up" style={{ animationDelay: '0.4s' }}>
                <span className="text-3xl font-black text-gray-900">100%</span>
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Minh bạch</span>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={10} className="relative hidden lg:block">
            <div className="floating-element">
              <div className="glass-card rounded-[40px] p-4 shadow-2xl border-white relative z-10 hover-lift">
                <img
                  src="/images/trace.png"
                  alt="QR Traceability"
                  className="w-full rounded-[32px] shadow-sm"
                />
                <div className="absolute w-64 p-6 border-white shadow-xl -bottom-10 -right-10 glass-card rounded-3xl bounce-in">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleFilled className="text-xl text-green-500" />
                    <Text strong>Đã xác minh</Text>
                  </div>
                  <Text className="block mb-1 text-xs text-gray-500">Rau Cải Ngọt</Text>
                  <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div className="h-full bg-green-500 progress-animate" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default HeroSection
