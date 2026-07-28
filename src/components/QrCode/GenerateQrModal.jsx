import React, { useState } from 'react'
import { Modal, Button, Result, message, Image } from 'antd'
import { QrcodeOutlined, DownloadOutlined } from '@ant-design/icons'
import QrCodeService from 'src/services/QrCodeService'

const GenerateQrModal = ({ open, onCancel, batchId, batchName }) => {
  const [loading, setLoading] = useState(false)
  const [qrResult, setQrResult] = useState(null)

  const handleGenerate = async () => {
    if (!batchId) {
      message.error('Không tìm thấy mã lô sản phẩm!')
      return
    }
    try {
      setLoading(true)
      const res = await QrCodeService.generate(batchId)
      const data = res?.data?.data || res?.data || res
      setQrResult(data)
      message.success('Tạo mã QR truy xuất nguồn gốc thành công!')
    } catch (err) {
      console.error(err)
      message.error(err?.response?.data?.message || err?.message || 'Tạo mã QR thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setQrResult(null)
    onCancel?.()
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2 font-bold text-green-700">
          <QrcodeOutlined className="text-xl" /> Tạo Mã QR Traceability Truy Xuất Nguồn Gốc
        </div>
      }
      footer={null}
      width={480}
      destroyOnClose
    >
      <div className="py-4 text-center">
        {!qrResult ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Nhấn nút bên dưới để khởi tạo mã QR truy xuất nguồn gốc chính thức cho lô sản phẩm{' '}
              <strong className="text-gray-800">{batchName || batchId || ''}</strong>.
            </p>
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-800 text-left">
              <p className="font-bold mb-1">Mã QR truy xuất chứa thông tin:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Thông tin nông hộ & vùng trồng (Land Plot)</li>
                <li>Toàn bộ nhật ký canh tác chính thức (Official Logbook)</li>
                <li>Lịch sử bón phân, phun thuốc & kiểm định chất lượng</li>
              </ul>
            </div>

            <Button
              type="primary"
              size="large"
              icon={<QrcodeOutlined />}
              loading={loading}
              onClick={handleGenerate}
              className="bg-green-600 font-bold px-8 h-12 rounded-xl shadow-lg shadow-green-100"
            >
              Tạo mã QR ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Result
              status="success"
              title="Đã khởi tạo mã QR thành công!"
              subTitle={`Mã truy xuất: ${qrResult.traceCode || qrResult.code || 'TraceCode'}`}
            />
            {qrResult.qrImageUrl || qrResult.imageUrl ? (
              <div className="flex flex-col items-center gap-3">
                <Image
                  src={qrResult.qrImageUrl || qrResult.imageUrl}
                  alt="QR Code"
                  width={200}
                  className="rounded-xl border border-gray-200 shadow-sm p-2 bg-white"
                />
                <a
                  href={qrResult.qrImageUrl || qrResult.imageUrl}
                  download={`QR_${qrResult.traceCode || 'product'}.png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button icon={<DownloadOutlined />} className="rounded-xl font-semibold">
                    Tải ảnh QR Code
                  </Button>
                </a>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default GenerateQrModal
