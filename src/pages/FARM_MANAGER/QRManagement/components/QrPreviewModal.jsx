import { CopyOutlined, EyeOutlined } from "@ant-design/icons"
import { Button, Modal, Typography, message } from "antd"
import { QRCodeSVG } from "qrcode.react"
import { TraceView } from "src/pages/ANONYMOUS/Trace"

const { Text } = Typography

const QrPreviewModal = ({
  open,
  onCancel,
  previewData,
  previewTraceUrl = "",
  batchCode = "N/A",
}) => {
  const previewTraceCode = previewData?.traceCode || ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(previewTraceUrl)
    message.success("Đã sao chép link truy xuất!")
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={860}
      centered
      title={
        <div className="flex items-center gap-2">
          <EyeOutlined className="text-blue-600" />
          <span>
            Xem trước trang truy xuất — Lô: <strong>{batchCode}</strong>
          </span>
        </div>
      }
      styles={{
        body: { padding: 0, maxHeight: "calc(85vh - 80px)", overflowY: "auto" },
      }}
    >
      {/* QR Code + Link Preview */}
      <div className="flex items-center gap-6 px-6 py-5 bg-white border-b border-gray-100">
        <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow border border-gray-100 flex flex-col items-center">
          {previewData?.qrImageDataUrl ? (
            <img
              src={previewData.qrImageDataUrl}
              alt={`QR xem trước ${batchCode}`}
              className="w-[120px] h-[120px] object-contain"
            />
          ) : (
            <QRCodeSVG
              value={previewTraceUrl}
              size={120}
              level="H"
              marginSize={1}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          )}
          <Text
            strong
            className="mt-2 block text-xs text-green-700 text-center"
          >
            {batchCode}
          </Text>
        </div>
        <div className="flex-1 min-w-0">
          <Text className="text-xs text-gray-500 block mb-1">Mã truy xuất</Text>
          <Text strong className="text-sm text-green-800 font-mono block mb-3">
            {previewTraceCode || "—"}
          </Text>
          <Text className="text-xs text-gray-500 block mb-1">
            Link truy xuất:
          </Text>
          <div className="flex items-center gap-2">
            <Text className="text-xs text-blue-600 font-mono truncate flex-1 bg-blue-50 px-2 py-1 rounded">
              {previewTraceUrl || "—"}
            </Text>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              Sao chép
            </Button>
          </div>
        </div>
      </div>

      <TraceView
        traceabilityData={previewData?.traceability}
        qrCode={previewTraceCode}
        isPreview={true}
      />
    </Modal>
  )
}

export default QrPreviewModal
