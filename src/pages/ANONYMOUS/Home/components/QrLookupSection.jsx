import React from 'react'
import { Card, Form, Input, Button, Typography } from 'antd'
import { QrcodeOutlined, SearchOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from 'src/services/01_axios'
import { message } from 'antd'

const { Text } = Typography

const QrLookupSection = () => {
  const navigate = useNavigate()
  const [qrForm] = Form.useForm()
  const [qrSearching, setQrSearching] = React.useState(false)

  const handleQrSearch = async (values) => {
    const qrCode = values?.qrCode?.trim()
    if (!qrCode) {
      message.warning('Vui lòng nhập mã truy xuất!')
      return
    }

    setQrSearching(true)
    try {
      const response = await api.get(`/traceability/${encodeURIComponent(qrCode)}`, {
        skipNotice: true,
        skipAuthRedirect: true,
      })
      const payload = response?.data?.data ?? response?.data
      if (payload && (payload.harvestBatch || payload.batchCode || payload.id || payload.success)) {
        navigate(`/trace/${encodeURIComponent(qrCode)}`)
      } else {
        // Fallback: navigate directly to trace page to let it handle display
        navigate(`/trace/${encodeURIComponent(qrCode)}`)
      }
    } catch (error) {
      // Direct navigation to trace page anyway so user sees clean trace error state
      navigate(`/trace/${encodeURIComponent(qrCode)}`)
    } finally {
      setQrSearching(false)
    }
  }

  return (
    <section id="qr-lookup-section" className="py-14 px-6" style={{ background: '#f5f5f5' }}>
      <div className="mx-auto max-w-4xl">
        {/* Tiêu đề */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded"
            style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}
          >
            <QrcodeOutlined style={{ color: '#2e7d32' }} />
            <Text
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#2e7d32',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Tra cứu nguồn gốc
            </Text>
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: 8,
            }}
          >
            Kiểm tra thông tin sản phẩm
          </h2>
          <p style={{ color: '#616161', fontSize: '0.97rem', maxWidth: 500, margin: '0 auto' }}>
            Nhập mã truy xuất hoặc quét mã QR trên tem sản phẩm để xem thông tin nguồn gốc.
          </p>
        </div>

        {/* Form tìm kiếm */}
        <Card
          style={{
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          styles={{ body: { padding: '32px 40px' } }}
        >
          <Form form={qrForm} onFinish={handleQrSearch}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Form.Item name="qrCode" style={{ flex: 1, marginBottom: 0, minWidth: 260 }}>
                <Input
                  size="large"
                  placeholder="Nhập mã truy xuất (ví dụ: EAPLS-...)"
                  prefix={<SearchOutlined style={{ color: '#9e9e9e' }} />}
                  style={{ borderRadius: 6, height: 46 }}
                  disabled={qrSearching}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={qrSearching}
                icon={<ArrowRightOutlined />}
                style={{
                  background: '#2e7d32',
                  borderColor: '#2e7d32',
                  height: 46,
                  paddingInline: 28,
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Tra cứu
              </Button>
            </div>
          </Form>

          {/* Hướng dẫn */}
          <div
            className="flex flex-wrap gap-6 mt-6 pt-6"
            style={{ borderTop: '1px solid #f0f0f0' }}
          >
            <Text style={{ fontSize: '0.82rem', color: '#757575' }}>
              <strong style={{ color: '#424242' }}>Hướng dẫn quét QR:</strong>
            </Text>
            {[
              { icon: '📱', text: 'Camera iPhone' },
              { icon: '📷', text: 'Camera Android' },
              { icon: '💬', text: 'Zalo / Messenger' },
            ].map((guide, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span>{guide.icon}</span>
                <Text style={{ fontSize: '0.82rem', color: '#616161' }}>{guide.text}</Text>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}

export default QrLookupSection
