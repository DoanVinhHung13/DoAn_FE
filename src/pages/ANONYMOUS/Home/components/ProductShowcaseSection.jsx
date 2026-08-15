import React, { useState } from 'react'
import { Row, Col, Typography, Tag, Button, Modal, Steps } from 'antd'
import { QrcodeOutlined, ArrowRightOutlined, CheckCircleFilled, SafetyCertificateFilled } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

const { Title, Text, Paragraph } = Typography

const products = [
  {
    name: 'Gạo sạch ST25 Organic',
    brand: 'HTX Nông nghiệp Hiệp Hòa',
    image: '/images/rice_product.png',
    tag: 'Lương thực',
    color: 'green',
    detail: {
      origin: 'Cánh đồng Hiệp Hòa, Bắc Giang',
      farmer: 'Nguyễn Văn A',
      variety: 'ST25 (Gạo ngon nhất thế giới)',
      harvestDate: '15/10/2025',
      standards: ['VietGAP', 'Organic USDA'],
      timeline: [
        { date: '01/06/2025', activity: 'Làm đất và gieo mạ', note: 'Sử dụng giống ST25 thuần chủng' },
        { date: '20/06/2025', activity: 'Cấy lúa', note: 'Mật độ 25 khóm/m²' },
        { date: '15/07/2025', activity: 'Bón phân hữu cơ đợt 1', note: 'Sử dụng phân bón vi sinh chuyên dụng' },
        { date: '10/09/2025', activity: 'Kiểm tra chất lượng', note: 'Không phát hiện dư lượng nông dược' },
        { date: '15/10/2025', activity: 'Thu hoạch và sấy khô', note: 'Độ ẩm đạt chuẩn 14%' },
      ],
    },
  },
  {
    name: 'Trái cây xuất khẩu chuẩn VietGAP',
    brand: 'Nông trại Ogasachi',
    image: '/images/fruit_product.png',
    tag: 'Trái cây',
    color: 'orange',
    detail: {
      origin: 'Cao nguyên Lâm Đồng',
      farmer: 'Trần Thị B',
      variety: 'Táo/Cam organic',
      harvestDate: '20/11/2025',
      standards: ['GlobalGAP', 'HACCP'],
      timeline: [
        { date: '10/01/2025', activity: 'Cắt tỉa cành vụ mới', note: 'Tạo tán và vệ sinh vườn' },
        { date: '15/03/2025', activity: 'Ra hoa và thụ phấn', note: 'Thời tiết thuận lợi' },
        { date: '20/06/2025', activity: 'Bao trái', note: 'Sử dụng túi bao chuyên dụng' },
        { date: '05/11/2025', activity: 'Kiểm định chất lượng', note: 'Đạt chuẩn size và độ đường' },
        { date: '20/11/2025', activity: 'Thu hoạch và đóng gói', note: 'Quy trình lạnh khép kín' },
      ],
    },
  },
  {
    name: 'Mật ong hoa rừng tự nhiên',
    brand: 'Công ty TNHH Dược liệu Việt',
    image: '/images/honey_product.png',
    tag: 'Thực phẩm',
    color: 'gold',
    detail: {
      origin: 'Rừng nguyên sinh Yên Bái',
      farmer: 'HTX nuôi ong rừng',
      variety: 'Mật ong đa hoa rừng',
      harvestDate: '01/05/2025',
      standards: ['ISO 22000', 'OCOP 4 sao'],
      timeline: [
        { date: '01/03/2025', activity: 'Đặt thùng ong', note: 'Vùng hoa rừng tự nhiên' },
        { date: '15/03/2025', activity: 'Kiểm tra đàn ong', note: 'Đàn khỏe mạnh' },
        { date: '10/04/2025', activity: 'Kiểm tra độ chín', note: 'Vít nắp đạt 90%' },
        { date: '01/05/2025', activity: 'Khai thác mật', note: 'Công nghệ quay ly tâm' },
        { date: '10/05/2025', activity: 'Lọc và đóng chai', note: 'Vô trùng tuyệt đối' },
      ],
    },
  },
]

const ProductShowcaseSection = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showProductModal, setShowProductModal] = useState(false)

  const handleGetStarted = () => {
    if (user) {
      navigate(ROUTER.FM_DASHBOARD)
    } else {
      navigate(ROUTER.LOGIN)
    }
  }

  const handleOpenProduct = (product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  return (
    <>
      <section className="px-6 py-16 overflow-hidden bg-white md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-end justify-between gap-8 mb-16 md:flex-row scroll-reveal">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50">
                  <QrcodeOutlined className="text-2xl text-orange-600" />
                </div>
                <Tag color="orange" className="px-4 py-1 text-xs font-black tracking-widest uppercase rounded-full">
                  Sản phẩm thực tế
                </Tag>
              </div>
              <Title level={2} className="!text-gray-900 !mb-0 md:!text-5xl font-black">
                Sản phẩm đã được minh bạch hóa
              </Title>
              <Paragraph className="text-lg text-gray-500">
                Hàng ngàn sản phẩm nông sản đã được gắn mã QR truy xuất nguồn gốc, giúp người tiêu dùng an tâm sử dụng.
              </Paragraph>
            </div>
            <Button type="primary" size="large" className="px-8 font-bold bg-orange-600 border-0 shadow-lg hover:bg-orange-700 h-14 rounded-xl shadow-orange-200">
              Xem tất cả sản phẩm <ArrowRightOutlined />
            </Button>
          </div>

          <Row gutter={[32, 32]}>
            {products.map((product, idx) => (
              <Col xs={24} md={8} key={idx}>
                <div
                  className="relative cursor-pointer group scroll-reveal hover-lift"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => handleOpenProduct(product)}
                >
                  <div className="relative h-[450px] rounded-[40px] overflow-hidden shadow-2xl">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 transition-opacity bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100"></div>
                    <div className="absolute top-6 left-6">
                      <Tag color={product.color} className="px-4 py-1 font-bold border-0 rounded-full shadow-lg">
                        {product.tag}
                      </Tag>
                    </div>
                    <div className="absolute space-y-3 bottom-8 left-8 right-8">
                      <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white/70">
                        {product.brand}
                      </div>
                      <Title level={3} className="!text-white !mb-0 !text-2xl font-black leading-tight">
                        {product.name}
                      </Title>
                      <div className="flex items-center justify-between pt-4 transition-all duration-500 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                        <div className="flex items-center gap-2 font-bold text-orange-400">
                          <QrcodeOutlined className="text-xl" />
                          <span>Xem báo cáo truy xuất</span>
                        </div>
                        <div className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-white/20 backdrop-blur-md">
                          <ArrowRightOutlined />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Product Traceability Modal */}
      <Modal
        open={showProductModal}
        onCancel={() => setShowProductModal(false)}
        footer={null}
        width={700}
        centered
        styles={{ content: { padding: 0, borderRadius: '32px', overflow: 'hidden' } }}
        className="product-trace-modal"
      >
        {selectedProduct && (
          <div className="bg-white">
            <div className="relative p-8 text-white bg-gradient-to-r from-gray-900 to-blue-900">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-16 h-16 p-2 bg-white rounded-2xl">
                  <QrcodeOutlined style={{ fontSize: '40px' }} className="text-blue-900" />
                </div>
                <div>
                  <Text className="block mb-1 text-xs font-black tracking-widest text-blue-300 uppercase">Xác thực nguồn gốc</Text>
                  <Title level={3} className="!text-white !mb-0 font-black">{selectedProduct.name}</Title>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Tag color="blue" className="px-4 font-bold text-white border-0 rounded-full bg-white/10">Lô: EB-{new Date().getFullYear()}-001</Tag>
                <Tag color="green" className="px-4 font-bold text-white border-0 rounded-full bg-white/10">Trạng thái: Đã kiểm duyệt</Tag>
              </div>
            </div>

            <div className="p-8 space-y-10 md:p-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Nhà sản xuất</Text>
                  <Text strong className="block text-base text-gray-800">{selectedProduct.brand}</Text>
                </div>
                <div className="space-y-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Hộ nông dân</Text>
                  <Text strong className="block text-base text-gray-800">{selectedProduct.detail.farmer} - {selectedProduct.detail.origin}</Text>
                </div>
                <div className="space-y-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Giống / Chủng loại</Text>
                  <Text strong className="block text-base text-gray-800">{selectedProduct.detail.variety}</Text>
                </div>
                <div className="space-y-1">
                  <Text className="text-gray-400 text-[10px] uppercase font-black tracking-wider">Ngày thu hoạch</Text>
                  <Text strong className="block text-base text-gray-800">{selectedProduct.detail.harvestDate}</Text>
                </div>
              </div>

              <div>
                <Title level={4} className="!mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  Hành trình sản xuất sạch
                </Title>
                <Steps direction="vertical" size="small" current={selectedProduct.detail.timeline.length}
                  items={selectedProduct.detail.timeline.map(t => ({
                    title: <Text strong className="text-sm">{t.activity}</Text>,
                    description: (
                      <div className="mt-1 text-xs text-gray-500">
                        <div className="text-blue-600 font-bold mb-0.5">{t.date}</div>
                        {t.note}
                      </div>
                    ),
                    status: 'finish',
                  }))}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Title level={5} className="!mb-0 text-gray-800">Chứng nhận chất lượng</Title>
                  <CheckCircleFilled className="text-xl text-green-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.detail.standards.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 shadow-sm rounded-xl">
                      <SafetyCertificateFilled className="text-blue-600" />
                      <Text strong className="text-xs">{s}</Text>
                    </div>
                  ))}
                </div>
                <Text className="text-[10px] text-gray-400 block mt-4 text-center italic">
                  * Toàn bộ dữ liệu được xác thực và bảo vệ bởi hệ thống EAPLS Blockchain
                </Text>
              </div>

              <div className="flex gap-4">
                <Button block size="large" className="h-14 rounded-2xl bg-gray-900 text-white border-0 font-bold hover:!bg-black transition-all" onClick={() => setShowProductModal(false)}>
                  Đóng báo cáo
                </Button>
                <Button type="primary" size="large" className="px-10 font-bold bg-blue-600 border-0 shadow-lg h-14 rounded-2xl shadow-blue-200" onClick={() => { setShowProductModal(false); handleGetStarted(); }}>
                  Tôi muốn dùng hệ thống này
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ProductShowcaseSection
