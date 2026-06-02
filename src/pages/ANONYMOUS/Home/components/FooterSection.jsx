import React from 'react'
import { Typography, Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const FooterSection = () => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/login')
  }

  return (
    <section className="px-6 py-24">
      <div className="relative mx-auto max-w-7xl group scroll-reveal">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-[40px] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 morph-shape"></div>
        <div className="relative bg-gray-900 rounded-[40px] p-12 md:p-24 overflow-hidden flex flex-col items-center text-center space-y-12 hover-lift">
          <div className="absolute top-0 right-0 z-0 w-full h-full opacity-30 floating-element">
            <img src="/images/supply.png" alt="Supply Chain" className="object-cover w-full h-full" />
          </div>
          <div className="relative z-10 max-w-4xl space-y-6">
            <Title className="!text-white !mb-0 md:!text-6xl font-black">
              Sẵn sàng để đưa nông trại của bạn lên tầm cao mới?
            </Title>
            <Paragraph className="text-xl leading-relaxed text-gray-400">
              Hãy tham gia cùng hàng ngàn nông hộ và HTX đã số hóa quy trình sản xuất cùng EBookFarm.
            </Paragraph>
          </div>
          <div className="relative z-10 flex flex-wrap justify-center gap-6">
            <Button
              type="primary"
              size="large"
              className="h-16 px-12 text-xl font-black bg-green-600 border-0 shadow-2xl hover:bg-green-700 rounded-2xl shadow-green-200/50 shine-effect hover-lift"
              onClick={handleGetStarted}
            >
              Bắt đầu miễn phí <ArrowRightOutlined />
            </Button>
            <Button
              size="large"
              className="h-16 px-12 text-xl font-bold text-white transition-all border-2 rounded-2xl border-white/20 hover:border-white hover:text-white bg-white/5 backdrop-blur-md hover-lift"
            >
              Liên hệ tư vấn
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FooterSection
