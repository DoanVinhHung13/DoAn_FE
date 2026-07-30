import React from 'react'
import { Col, Row, Typography, Button, Space, Tag } from 'antd'
import { ArrowRightOutlined, SearchOutlined, CheckCircleFilled, QrcodeOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ROUTER from 'src/router/ROUTER'

const { Title, Paragraph, Text } = Typography

const HeroSection = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)

  const handleGetStarted = () => navigate(user ? ROUTER.FM_DASHBOARD : ROUTER.LOGIN)

  return (
    <section className="relative overflow-hidden bg-slate-50 px-6 pb-20 pt-32 md:pb-32 md:pt-48">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-green-400/20 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-400/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={14} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-4 py-1.5">
              <Tag color="green" className="m-0 rounded-full font-bold">Mới</Tag>
              <Text className="text-xs font-bold uppercase tracking-wider text-green-700">Hệ thống truy xuất chuẩn quốc gia TCVN</Text>
            </div>
            <Title className="!mb-6 !text-gray-900 !text-4xl font-black leading-[1.1] md:!text-7xl">
              Minh bạch <span className="gradient-text">nguồn gốc</span>,<br />
              nâng tầm <span className="gradient-text">giá trị</span> nông sản.
            </Title>
            <Paragraph className="max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
              EAPLS cung cấp giải pháp chuyển đổi số cho nông trại, HTX và doanh nghiệp — từ nhật ký sản xuất điện tử đến truy xuất nguồn gốc bằng mã QR.
            </Paragraph>
            <Space size="middle" className="flex-wrap pt-4">
              <Button type="primary" size="large" className="h-16 rounded-2xl border-0 bg-green-600 px-10 text-lg font-black shadow-xl shadow-green-200 hover:bg-green-700" onClick={handleGetStarted}>
                Số hóa nông trại ngay <ArrowRightOutlined />
              </Button>
              <Button size="large" className="h-16 rounded-2xl border-2 border-gray-100 px-10 text-lg font-bold hover:border-green-500 hover:text-green-600" onClick={() => navigate(ROUTER.TCVN)}>
                Tra cứu tiêu chuẩn <SearchOutlined />
              </Button>
            </Space>
          </Col>

          <Col xs={24} lg={10} className="relative hidden lg:block">
            <div className="mx-auto max-w-md rounded-[32px] border border-green-100 bg-white p-8 shadow-xl shadow-green-100/60">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl text-green-600"><QrcodeOutlined /></div>
                <CheckCircleFilled className="text-2xl text-green-500" />
              </div>
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-3xl border-4 border-dashed border-green-200 bg-green-50 text-7xl text-green-600"><SafetyCertificateOutlined /></div>
              <div className="mt-8 space-y-3">
                <Text strong className="block text-lg text-gray-900">Dữ liệu minh bạch</Text>
                <Text className="block text-sm leading-relaxed text-gray-500">Mỗi sản phẩm được gắn với hồ sơ sản xuất rõ ràng, dễ kiểm chứng.</Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default HeroSection
