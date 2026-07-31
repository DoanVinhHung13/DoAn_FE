import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography } from 'antd'
import { QrcodeOutlined, SearchOutlined, ArrowRightOutlined, CameraOutlined, CheckOutlined, SafetyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from 'src/services/01_axios'
import { normalizeApiError } from 'src/services/core/apiError'
import { message } from 'antd'

const { Text } = Typography

const QrLookupSection = () => {
  const navigate = useNavigate()
  const [qrForm] = Form.useForm()
  const [qrSearching, setQrSearching] = useState(false)

  const handleQrSearch = async (values) => {
    const qrCode = values?.qrCode?.trim()
    if (!qrCode) {
      message.warning('Vui lòng nhập mã truy xuất!')
      return
    }

    setQrSearching(true)
    try {
      const response = await api.get(`/journals/qr/${qrCode}`)

      if (response?.success) {
        navigate(`/trace/${qrCode}`)
      }
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      if (normalizedError.code === 'NOT_FOUND' || normalizedError.message) {
        message.error(normalizedError.message)
      }
    } finally {
      setQrSearching(false)
    }
  }

  return (
    <section className="py-16 md:py-20 px-6 relative overflow-hidden bg-[#fafafa]">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="mb-16 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 px-4 py-2 mb-6 transition-all bg-white border border-gray-100 shadow-sm rounded-2xl hover-lift">
            <QrcodeOutlined className="text-xl text-green-600" />
            <Text className="text-gray-900 font-black uppercase text-[10px] tracking-widest">
              Trung tâm xác thực
            </Text>
          </div>
          <h2 className="!text-gray-900 !mb-4 md:!text-5xl font-black">
            Tra cứu nguồn gốc sản phẩm
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-500">
            Minh bạch thông tin từ nông trại đến bàn ăn chỉ với một thao tác quét mã hoặc nhập mã truy xuất.
          </p>
        </div>

        <div className="relative scroll-reveal">
          <div className="absolute -inset-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-3xl rounded-[50px] -z-10"></div>

          <Card
            className="rounded-[40px] shadow-2xl border-white bg-white/70 backdrop-blur-xl overflow-hidden p-0"
            styles={{ body: { padding: 0 } }}
          >
            <div className="grid md:grid-cols-12">
              {/* Left Side: Input Form */}
              <div className="p-8 space-y-8 border-b border-gray-100 md:col-span-7 md:p-12 md:border-b-0 md:border-r">
                <div className="space-y-2">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Xác thực bằng mã
                  </Text>
                  <h4 className="!text-gray-900 !mb-0 font-black">Nhập mã truy xuất điện tử</h4>
                </div>

                <Form form={qrForm} onFinish={handleQrSearch} className="space-y-4">
                  <Form.Item name="qrCode" className="!mb-0">
                    <Input
                      size="large"
                      placeholder="Nhập mã (ví dụ: 1a83ca5c...)"
                      prefix={<SearchOutlined className="mr-2 text-blue-500" />}
                      className="h-16 rounded-[20px] text-base border-gray-100 bg-gray-50/50 hover:bg-white focus:bg-white transition-all shadow-inner"
                      disabled={qrSearching}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={qrSearching}
                    className="h-16 rounded-[20px] bg-gradient-to-r from-gray-900 to-blue-900 hover:from-black hover:to-blue-800 border-0 font-black text-lg shadow-xl shadow-blue-100 transition-all hover-lift"
                  >
                    Tra cứu thông tin ngay <ArrowRightOutlined className="ml-2" />
                  </Button>
                </Form>

                <div className="pt-4 space-y-4">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Hướng dẫn quét QR
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: '📱', text: 'iPhone Camera', color: 'blue' },
                      { icon: '📷', text: 'Android Camera', color: 'green' },
                      { icon: '💬', text: 'Zalo / Messenger', color: 'purple' },
                    ].map((guide, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-0 shadow-sm cursor-pointer rounded-xl hover-lift"
                        style={{ borderColor: 'transparent' }}
                      >
                        <span>{guide.icon}</span>
                        <span className="text-[11px] font-bold" style={{ color: guide.color === 'blue' ? '#1677ff' : guide.color === 'green' ? '#52c41a' : '#722ed1' }}>
                          {guide.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Camera Simulation Area */}
              <div className="relative flex flex-col items-center justify-center p-8 overflow-hidden text-center md:col-span-5 bg-slate-900 md:p-12">
                <img
                  src="/images/qr_scan_farm.png"
                  alt="Quản lý trên Mobile"
                  className="absolute inset-0 object-cover w-full h-full opacity-30 mix-blend-screen"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full opacity-50 scan-line"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <QrcodeOutlined style={{ fontSize: '300px' }} className="text-green-500" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="w-48 h-48 mx-auto relative border-2 border-green-500/30 rounded-[32px] p-4 group cursor-pointer hover:border-green-400 transition-all">
                    <div className="absolute w-8 h-8 border-t-4 border-l-4 border-green-500 -top-1 -left-1 rounded-tl-xl"></div>
                    <div className="absolute w-8 h-8 border-t-4 border-r-4 border-green-500 -top-1 -right-1 rounded-tr-xl"></div>
                    <div className="absolute w-8 h-8 border-b-4 border-l-4 border-green-500 -bottom-1 -left-1 rounded-bl-xl"></div>
                    <div className="absolute w-8 h-8 border-b-4 border-r-4 border-green-500 -bottom-1 -right-1 rounded-br-xl"></div>
                    <div className="w-full h-full bg-white/5 rounded-[20px] flex items-center justify-center group-hover:bg-green-500/10 transition-all">
                      <CameraOutlined className="text-4xl text-green-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Text className="block text-lg font-black text-white">
                      Quét QR bằng camera
                    </Text>
                    <Text className="block text-xs leading-relaxed text-gray-400">
                      Tự động nhận diện, kiểm chứng hàng chính hãng
                      <br />
                      và hiển thị báo cáo truy xuất minh bạch.
                    </Text>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center w-10 h-10 text-green-500 rounded-full bg-white/10">
                        <CheckOutlined />
                      </div>
                      <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Nhanh chóng
                      </Text>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center w-10 h-10 text-blue-500 rounded-full bg-white/10">
                        <SafetyOutlined />
                      </div>
                      <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Xác thực
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default QrLookupSection
