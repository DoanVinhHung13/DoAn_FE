import React, { useState } from 'react'
import { Row, Col, Card, Form, Input, Button, Typography, Select } from 'antd'
import { PhoneOutlined, MailOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons'
import ConsultationService from 'src/services/ConsultationService'
import { message, Modal } from 'antd'
import { SafetyCertificateFilled } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

const ConsultationSection = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleConsultationSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await ConsultationService.createConsultation(values)

      if (response.data.success) {
        if (response.data.data?.aiResponse) {
          message.success({
            content: 'Gửi yêu cầu thành công! Vui lòng kiểm tra email để xem gợi ý sơ bộ từ AI EBookFarm.',
            duration: 5,
          })

          Modal.success({
            title: 'Gợi ý sơ bộ từ AI EBookFarm',
            content: (
              <div className="p-4 mt-4 border border-blue-100 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                    <SafetyCertificateFilled className="text-white" />
                  </div>
                  <Text strong className="text-blue-700">Trợ lý AI</Text>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">Llama 3.1</span>
                </div>
                <Paragraph className="italic text-gray-700">"{response.data.data.aiResponse}"</Paragraph>
                <div className="border-t border-blue-100 pt-3 mt-3">
                  <Text type="secondary" className="text-xs">* Đây là phản hồi tự động. Chuyên gia của chúng tôi sẽ liên hệ trực tiếp trong 24h.</Text>
                </div>
              </div>
            ),
            width: 600,
            okText: 'Tôi đã hiểu',
          })
        } else {
          message.success(response.data.message || 'Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong 24h.')
        }
        form.resetFields()
      }
    } catch (error) {
      console.error('Consultation submit error:', error)
      message.error(error.response?.data?.message || 'Không thể kết nối đến server. Vui lòng thử lại sau!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative px-6 py-24 overflow-hidden bg-white md:py-32">
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <img src="/images/hero.png" alt="" className="object-cover w-full h-full" />
      </div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-green-200/20 blur-[100px] rounded-full blob-animate"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <div className="space-y-6 scroll-reveal">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
                  <PhoneOutlined className="text-2xl text-green-600" />
                </div>
                <span className="px-4 py-1 text-xs font-black tracking-widest uppercase bg-green-50 text-green-600 rounded-full">Liên hệ</span>
              </div>
              <Title level={2} className="!text-gray-900 !mb-0 md:!text-4xl font-black">
                Nhận tư vấn & trải nghiệm ngay
              </Title>
              <Paragraph className="text-lg leading-relaxed text-gray-500">
                Để lại thông tin và chuyên viên sẽ liên hệ tư vấn chi tiết cho bạn trong 24h.
              </Paragraph>
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-3 hover-lift">
                  <div className="flex items-center justify-center w-10 h-10 text-green-600 rounded-lg bg-green-50 pulse-glow">
                    <PhoneOutlined />
                  </div>
                  <div>
                    <Text className="block text-xs font-bold text-gray-400 uppercase">Hotline</Text>
                    <Text strong className="text-gray-900">02462730.818</Text>
                  </div>
                </div>
                <div className="flex items-center gap-3 hover-lift">
                  <div className="flex items-center justify-center w-10 h-10 text-green-600 rounded-lg bg-green-50 pulse-glow">
                    <MailOutlined />
                  </div>
                  <div>
                    <Text className="block text-xs font-bold text-gray-400 uppercase">Email</Text>
                    <Text strong className="text-gray-900">tuvansct@gmail.com</Text>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-xl rounded-3xl scroll-reveal hover-lift">
              <Form form={form} layout="vertical" onFinish={handleConsultationSubmit} className="space-y-2">
                <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                  <Input size="large" placeholder="Nguyễn Văn A" prefix={<UserOutlined className="text-gray-300" />} className="rounded-xl" />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }, { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }]}>
                  <Input size="large" placeholder="0912345678" prefix={<PhoneOutlined className="text-gray-300" />} className="rounded-xl" />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                  <Input size="large" placeholder="email@example.com" prefix={<MailOutlined className="text-gray-300" />} className="rounded-xl" />
                </Form.Item>

                <Form.Item name="organization" label="Tên doanh nghiệp/HTX">
                  <Input size="large" placeholder="HTX Nông nghiệp..." prefix={<ShopOutlined className="text-gray-300" />} className="rounded-xl" />
                </Form.Item>

                <Form.Item name="category" label="Lĩnh vực cần tư vấn" initialValue="Kỹ thuật">
                  <Select size="large" className="rounded-xl">
                    <Option value="Kỹ thuật">Hỗ trợ kỹ thuật / Canh tác</Option>
                    <Option value="Báo giá">Báo giá dịch vụ / Phần mềm</Option>
                    <Option value="Hợp tác">Hợp tác kinh doanh</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="message" label="Nội dung cần tư vấn" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
                  <Input.TextArea rows={3} placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." className="rounded-xl" />
                </Form.Item>

                <Form.Item className="!mb-0 !mt-6">
                  <Button type="primary" htmlType="submit" size="large" block loading={loading} className="h-12 text-base font-bold bg-green-600 border-0 rounded-xl hover:bg-green-700 shine-effect">
                    Đăng ký tư vấn miễn phí
                  </Button>
                </Form.Item>
                <Text className="block mt-3 text-xs text-center text-gray-400">
                  Chúng tôi cam kết bảo mật thông tin cá nhân của bạn
                </Text>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default ConsultationSection
