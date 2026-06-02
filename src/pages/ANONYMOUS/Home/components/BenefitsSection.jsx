import React from 'react'
import { Row, Col, Card, Typography, Tag } from 'antd'
import {
  TrophyOutlined,
  LineChartOutlined,
  SafetyOutlined,
  GlobalOutlined,
  TeamOutlined,
  DollarOutlined,
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const benefits = [
  {
    icon: <TrophyOutlined />,
    title: 'Tạo ưu thế cạnh tranh',
    desc: 'Áp dụng truy xuất nguồn gốc giúp tăng cơ hội đàm phán và bán được giá tốt hơn trên thị trường.',
    gradient: 'from-orange-400 to-amber-600',
  },
  {
    icon: <LineChartOutlined />,
    title: 'Tối ưu quy trình sản xuất',
    desc: 'Quản lý hiệu quả vùng sản xuất, kiểm soát rủi ro, tối ưu nhân sự và chi phí vận hành.',
    gradient: 'from-blue-400 to-indigo-600',
  },
  {
    icon: <SafetyOutlined />,
    title: 'Chống hàng giả & Bảo vệ thương hiệu',
    desc: 'Hệ thống tem QR chống giả và dữ liệu Blockchain giúp ngăn chặn hành vi làm nhái.',
    gradient: 'from-green-400 to-emerald-600',
  },
  {
    icon: <GlobalOutlined />,
    title: 'Mở rộng thị trường xuất khẩu',
    desc: 'Đáp ứng đầy đủ các tiêu chuẩn khắt khe quốc tế, dễ dàng tiếp cận thị trường nước ngoài.',
    gradient: 'from-purple-400 to-violet-600',
  },
  {
    icon: <TeamOutlined />,
    title: 'Minh bạch chuỗi cung ứng',
    desc: 'Hỗ trợ minh bạch toàn bộ hoạt động sản xuất để chứng minh năng lực thực tế của doanh nghiệp.',
    gradient: 'from-pink-400 to-rose-600',
  },
  {
    icon: <DollarOutlined />,
    title: 'Tăng doanh thu bền vững',
    desc: 'Quảng bá thông tin sản phẩm chuyên nghiệp, tăng độ nhận diện thương hiệu và doanh số bán hàng.',
    gradient: 'from-cyan-400 to-teal-600',
  },
]

const BenefitsSection = () => {
  return (
    <section className="relative px-6 py-16 overflow-hidden bg-slate-50 md:py-20">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 mx-auto space-y-12 max-w-7xl">
        <div className="max-w-3xl mx-auto space-y-4 text-center scroll-reveal">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
              <TrophyOutlined className="text-2xl text-green-600" />
            </div>
            <Tag color="green" className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge">
              Giá trị mang lại
            </Tag>
          </div>
          <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">
            Giá trị mà doanh nghiệp nhận được
          </Title>
          <Paragraph className="text-lg text-gray-500">
            Khi triển khai hệ thống truy xuất nguồn gốc với EBookFarm
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="mt-12">
          {benefits.map((item, idx) => (
            <Col xs={24} sm={12} lg={8} key={idx}>
              <div className="h-full group scroll-reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Card className="h-full rounded-[32px] border-white shadow-sm hover:shadow-2xl transition-all duration-500 hover-lift bg-white/80 backdrop-blur-md overflow-hidden">
                  <div className="relative p-2">
                    <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-[0.03] rounded-br-[60px] -z-10 group-hover:opacity-[0.08] transition-opacity`}></div>
                    <div className="p-4 space-y-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white shadow-xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br ${item.gradient}`}>
                        {item.icon}
                      </div>
                      <div className="space-y-3">
                        <Title level={3} className="!mb-0 !text-gray-900 !text-xl font-black group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </Title>
                        <Paragraph className="mb-0 text-sm leading-relaxed text-gray-500">{item.desc}</Paragraph>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  )
}

export default BenefitsSection
