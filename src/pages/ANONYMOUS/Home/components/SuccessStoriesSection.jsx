import React, { useState } from 'react'
import { Row, Col, Card, Typography, Tag, Button, Modal, Divider } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const stories = [
  {
    name: 'HTX Nông nghiệp Hiệp Hòa',
    location: 'Bắc Giang',
    area: '500 ha',
    product: 'Vải thiều',
    image: '/images/lychee_farm.png',
    result: 'Quản lý 500ha vải thiều, số hóa toàn bộ quy trình từ chăm sóc đến thu hoạch. Sản phẩm đạt chuẩn VietGAP và xuất khẩu thành công.',
    stats: ['500+ nông hộ', 'VietGAP', 'Xuất khẩu'],
    detail: {
      challenge: 'Trước đây, HTX gặp khó khăn trong việc kiểm soát nhật ký canh tác của hàng trăm hộ nông dân lẻ tẻ, dẫn đến chất lượng không đồng đều và khó đáp ứng tiêu chuẩn xuất khẩu.',
      solution: 'Áp dụng EAPLS để số hóa quy trình ghi chép. Mỗi nông hộ được cấp tài khoản mobile để cập nhật hoạt động hàng ngày. Cán bộ HTX giám sát thời gian thực qua bảng điều khiển trung tâm.',
      impact: '100% sản lượng đạt chuẩn VietGAP, giá bán tăng 20% nhờ minh bạch nguồn gốc, mở rộng thị trường sang Nhật Bản và Châu Âu.',
    },
  },
  {
    name: 'Công ty TNHH Ogasachi',
    location: 'Tây Nguyên',
    area: '20 ha',
    product: 'Sachi hữu cơ',
    image: '/images/sachi_farm.png',
    result: 'Quản lý 20ha sachi và nhà xưởng 3000m². Minh bạch toàn bộ quy trình với đối tác xuất khẩu Đài Loan.',
    stats: ['20 ha', 'Hữu cơ', 'Xuất Đài Loan'],
    detail: {
      challenge: 'Đối tác nước ngoài yêu cầu khắt khe về việc minh bạch quá trình sử dụng phân bón hữu cơ và nông dược sinh học trong suốt chu kỳ sinh trưởng của cây Sachi.',
      solution: 'Triển khai hệ thống truy xuất nguồn gốc QR code tích hợp với nhật ký canh tác. Toàn bộ dữ liệu được lưu trữ không thể thay đổi trên hệ thống.',
      impact: 'Ký kết hợp đồng dài hạn với đối tác Đài Loan, giảm 30% thời gian báo cáo và đối soát dữ liệu chất lượng hàng tháng.',
    },
  },
  {
    name: 'Traphaco Pharma',
    location: 'Toàn quốc',
    area: '100+ ha',
    product: 'Dược liệu',
    image: '/images/medicinal_plants.png',
    result: 'Truy xuất nguồn gốc dược liệu từ vùng trồng đến sản xuất. Đảm bảo chất lượng và minh bạch với đối tác.',
    stats: ['100+ ha', 'GMP', 'Dược phẩm'],
    detail: {
      challenge: 'Quản lý vùng nguyên liệu dược liệu trải dài trên nhiều tỉnh thành, cần đảm bảo tuân thủ nghiêm ngặt chuẩn GACP-WHO.',
      solution: 'Sử dụng EAPLS để theo dõi chi tiết từ khâu chọn giống, thổ nhưỡng đến khi thu hoạch và vận chuyển về nhà máy chiết xuất.',
      impact: 'Số hóa hoàn toàn hồ sơ vùng trồng, nâng cao năng lực quản lý chuỗi cung ứng dược liệu sạch, đảm bảo 100% nguyên liệu đầu vào đạt chuẩn.',
    },
  },
]

const SuccessStoriesSection = () => {
  const [selectedStory, setSelectedStory] = useState(null)
  const [showStoryModal, setShowStoryModal] = useState(false)

  const handleOpenStory = (story) => {
    setSelectedStory(story)
    setShowStoryModal(true)
  }

  return (
    <>
      <section className="relative px-6 py-16 overflow-hidden bg-slate-50 md:py-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-32 h-32 top-10 left-10 text-green-600 opacity-20">QR</div>
          <div className="absolute w-32 h-32 bottom-10 right-10 text-blue-600 opacity-20">✓</div>
        </div>

        <div className="relative z-10 mx-auto space-y-16 max-w-7xl">
          <div className="max-w-3xl mx-auto space-y-4 text-center scroll-reveal">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50">
                <span className="text-2xl">👥</span>
              </div>
              <Tag color="purple" className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full pulse-badge">
                Khách hàng
              </Tag>
            </div>
            <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black gradient-text">
              Câu chuyện thành công
            </Title>
            <Paragraph className="text-lg text-gray-500">
              Hàng trăm doanh nghiệp và HTX đã tin tưởng sử dụng EAPLS
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {stories.map((story, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  className="h-full overflow-hidden transition-all border-gray-100 shadow-sm rounded-3xl hover:shadow-2xl scroll-reveal hover-lift"
                  styles={{ body: { padding: 0 } }}
                >
                  <div className="flex flex-col h-full space-y-0">
                    <div className="relative flex-shrink-0 h-56 overflow-hidden">
                      <img src={story.image} alt={story.name} className="object-cover w-full h-full transition-transform duration-700 transform hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-6 right-6">
                        <Text className="block mb-1 text-lg font-black leading-tight text-white">{story.name}</Text>
                        <Text className="flex items-center gap-1 text-xs font-bold tracking-widest uppercase text-white/80">
                          <GlobalOutlined /> {story.location}
                        </Text>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-6 space-y-6">
                      <div className="flex gap-4 text-center">
                        <div className="flex-1 p-3 border border-gray-100 bg-gray-50 rounded-2xl">
                          <Text className="block text-lg font-black text-gray-900">{story.area}</Text>
                          <Text className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Diện tích</Text>
                        </div>
                        <div className="flex-1 p-3 border border-gray-100 bg-gray-50 rounded-2xl">
                          <Text className="block text-lg font-black text-gray-900">{story.product}</Text>
                          <Text className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Sản phẩm</Text>
                        </div>
                      </div>

                      <Paragraph className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-3">{story.result}</Paragraph>

                      <div className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
                          {story.stats.map((stat, i) => (
                            <Tag key={i} color="green" className="px-3 font-medium border-green-100 rounded-full">{stat}</Tag>
                          ))}
                        </div>
                        <Button block className="h-12 font-bold transition-all border-gray-200 rounded-xl hover:border-green-500 hover:text-green-600" onClick={() => handleOpenStory(story)}>
                          Xem chi tiết câu chuyện
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Story Detail Modal */}
      <Modal
        open={showStoryModal}
        onCancel={() => setShowStoryModal(false)}
        footer={null}
        width={800}
        centered
        styles={{ content: { padding: 0, borderRadius: '32px', overflow: 'hidden' } }}
        className="story-modal"
      >
        {selectedStory && (
          <div className="space-y-0">
            <div className="relative h-64 overflow-hidden">
              <img src={selectedStory.image} alt={selectedStory.name} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <Tag color="green" className="px-4 font-bold border-0 rounded-full">Thành công tiêu biểu</Tag>
                  <Text className="text-sm text-white/80"><GlobalOutlined /> {selectedStory.location}</Text>
                </div>
                <Title level={2} className="!text-white !mb-0 !text-3xl font-black">{selectedStory.name}</Title>
              </div>
            </div>
            <div className="p-8 space-y-8 md:p-10">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <Text className="block mb-1 text-xs font-bold text-gray-400 uppercase">Diện tích</Text>
                  <Text className="text-xl font-black text-gray-900">{selectedStory.area}</Text>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <Text className="block mb-1 text-xs font-bold text-gray-400 uppercase">Sản phẩm</Text>
                  <Text className="text-xl font-black text-gray-900">{selectedStory.product}</Text>
                </div>
                <div className="col-span-2 p-4 bg-gray-50 rounded-2xl">
                  <Text className="block mb-1 text-xs font-bold text-gray-400 uppercase">Chứng chỉ hỗ trợ</Text>
                  <div className="flex flex-wrap gap-2">
                    {selectedStory.stats.map((s, i) => (
                      <Tag key={i} color="blue" className="m-0 rounded-full">{s}</Tag>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Title level={4} className="!text-red-500 flex items-center gap-2">
                    <div className="w-2 h-6 bg-red-500 rounded-full"></div> Thách thức ban đầu
                  </Title>
                  <Paragraph className="text-base leading-relaxed text-gray-600">{selectedStory.detail.challenge}</Paragraph>
                </div>
                <div>
                  <Title level={4} className="!text-blue-500 flex items-center gap-2">
                    <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Giải pháp từ EAPLS
                  </Title>
                  <Paragraph className="text-base leading-relaxed text-gray-600">{selectedStory.detail.solution}</Paragraph>
                </div>
                <div>
                  <Title level={4} className="!text-green-500 flex items-center gap-2">
                    <div className="w-2 h-6 bg-green-500 rounded-full"></div> Kết quả đạt được
                  </Title>
                  <Paragraph className="text-base font-medium leading-relaxed text-gray-600">{selectedStory.detail.impact}</Paragraph>
                </div>
              </div>

              <Divider />
              <div className="flex items-center justify-between p-6 bg-green-50 rounded-3xl">
                <div className="space-y-1">
                  <Text className="block text-sm text-gray-500">Bạn muốn đạt được thành công tương tự?</Text>
                  <Text strong className="text-lg text-green-700">Đăng ký tư vấn giải pháp ngay hôm nay!</Text>
                </div>
                <Button type="primary" size="large" className="h-12 font-bold bg-green-600 border-0 rounded-xl" onClick={() => setShowStoryModal(false)}>
                  Nhận tư vấn ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default SuccessStoriesSection
