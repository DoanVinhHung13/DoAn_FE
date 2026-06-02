import React from 'react'
import { Row, Col, Typography, Tag } from 'antd'
import { RocketOutlined, GlobalOutlined, TrophyOutlined, SafetyCertificateFilled, LineChartOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const AboutSection = () => {
  return (
    <section id="about-us" className="relative px-6 py-16 overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 md:py-20">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full blob-animate"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full blob-animate" style={{ animationDelay: '3s' }}></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20">
              <span className="text-2xl">👥</span>
            </div>
            <Tag color="green" className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge">
              Về chúng tôi
            </Tag>
          </div>
          <Title level={2} className="!text-white !mb-4 md:!text-5xl font-black">
            Công ty TNHH Dịch vụ Tư vấn
            <br />
            <span className="gradient-text">Khoa học và Công nghệ Việt</span>
          </Title>
          <Paragraph className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-400">
            Chính thức hoạt động từ tháng 7 năm 2013, được sáng lập bởi các chuyên gia giàu kinh nghiệm hoạt động ở nhiều lĩnh vực Kinh tế - Xã hội khác nhau.
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} className="mb-24">
          {/* Mission */}
          <Col xs={24} md={12}>
            <div className="h-full p-8 transition-all border bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl hover:bg-white/10 hover-lift scroll-reveal">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/20 shrink-0">
                  <RocketOutlined className="text-3xl text-green-400" />
                </div>
                <div>
                  <Text className="block text-xs font-black tracking-widest text-green-400 uppercase">Mission</Text>
                  <Title level={3} className="!text-white !mb-0">Sứ mệnh</Title>
                </div>
              </div>
              <Paragraph className="text-gray-300 text-base leading-relaxed !mb-0">
                Cung cấp các dịch vụ tư vấn quản lý và đào tạo chuyên nghiệp, đơn giản và hiệu quả. Mang lại những sản phẩm và dịch vụ có giá trị thực tế, giúp gia tăng hiệu quả hoạt động, phát triển bền vững và thịnh vượng cho các tổ chức và doanh nghiệp.
              </Paragraph>
            </div>
          </Col>

          {/* Vision */}
          <Col xs={24} md={12}>
            <div className="h-full p-8 transition-all border bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl hover:bg-white/10 hover-lift scroll-reveal">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/20 shrink-0">
                  <GlobalOutlined className="text-3xl text-blue-400" />
                </div>
                <div>
                  <Text className="block text-xs font-black tracking-widest text-blue-400 uppercase">Vision</Text>
                  <Title level={3} className="!text-white !mb-0">Tầm nhìn</Title>
                </div>
              </div>
              <Paragraph className="text-gray-300 text-base leading-relaxed !mb-0">
                Trở thành đối tác tin cậy và ưu tiên hàng đầu trong lĩnh vực cung cấp dịch vụ tư vấn quản lý và đào tạo chuyên nghiệp tại Việt Nam. Tập trung vào chất lượng, sáng tạo và sự cam kết, đóng góp tích cực vào sự phát triển toàn diện của cộng đồng và xã hội.
              </Paragraph>
            </div>
          </Col>
        </Row>

        {/* Strategic Objectives */}
        <div className="p-8 mb-12 border bg-white/5 backdrop-blur-sm border-white/10 rounded-3xl md:p-12 scroll-reveal">
          <div className="flex flex-col items-center gap-4 mb-12 text-center">
            <div className="flex items-center justify-center shadow-lg w-14 h-14 rounded-2xl bg-orange-500/20 shrink-0 shadow-orange-500/10">
              <TrophyOutlined className="text-3xl text-orange-400" />
            </div>
            <Title level={3} className="!text-white !mb-0 md:!text-4xl font-black">
              Mục tiêu chiến lược
            </Title>
          </div>
          <Row gutter={[32, 32]} justify="center">
            {[
              { icon: <LineChartOutlined />, color: '#10b981', text: 'Tập trung vào việc phát triển và mở rộng danh mục dịch vụ, bao gồm cả tư vấn quản lý và đào tạo chuyên nghiệp trong các lĩnh vực mới.' },
              { icon: <SafetyCertificateFilled />, color: '#3b82f6', text: 'Nâng cao chất lượng dịch vụ thông qua việc đào tạo nhân viên, áp dụng công nghệ mới và liên tục thu thập phản hồi từ khách hàng để cải thiện quy trình.' },
              { icon: <GlobalOutlined />, color: '#8b5cf6', text: 'Tăng cường hiện diện trực tuyến thông qua quảng bá, tiếp cận khách hàng tiềm năng qua các kênh truyền thông và marketing kỹ thuật số.' },
            ].map((obj, idx) => (
              <Col xs={24} md={8} key={idx}>
                <div className="flex flex-col items-center gap-4 text-center group">
                  <div
                    className="flex items-center justify-center transition-all duration-300 w-14 h-14 rounded-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: `${obj.color}20`, color: obj.color }}
                  >
                    <span className="text-3xl">{obj.icon}</span>
                  </div>
                  <Paragraph className="text-gray-300 text-sm leading-relaxed max-w-[280px]">{obj.text}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
