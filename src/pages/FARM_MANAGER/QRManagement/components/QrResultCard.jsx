import {
  CheckCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  PrinterOutlined,
  QrcodeOutlined,
} from "@ant-design/icons"
import { Button, Card, Col, Row, Tag, Typography } from "antd"
import { QRCodeSVG } from "qrcode.react"

const { Text, Paragraph } = Typography

const QrResultCard = ({
  qrData,
  batchDetail,
  currentTraceCode,
  traceUrl,
  qrContainerRef,
  showDailyLog,
  showMaterials,
  showPhotos,
  onDownload,
  onPrint,
  onCopy,
}) => {
  const isExisting = qrData?.isExisting
  const isQrEligible = batchDetail?.isQrEligible === true

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">
            {qrData
              ? isExisting
                ? "MÃ QR HIỆN TẠI"
                : "MÃ QR CHÍNH THỨC"
              : "KẾT QUẢ MÃ QR"}
          </span>
          {qrData ? (
            <Tag
              icon={<CheckCircleOutlined />}
              color={isExisting ? "blue" : "success"}
              className="px-3 py-1 text-xs font-bold rounded-full"
            >
              {isExisting ? "ĐANG HOẠT ĐỘNG" : "ĐÃ TẠO THÀNH CÔNG"}
            </Tag>
          ) : (
            <Tag
              color="default"
              className="px-3 py-1 text-xs font-bold rounded-full"
            >
              CHƯA KHỞI TẠO
            </Tag>
          )}
        </div>
      }
      className="rounded-2xl shadow-sm border-0 h-full flex flex-col justify-between"
    >
      {qrData ? (
        <div className="space-y-4">
          {/* Banner khi hiển thị QR có sẵn */}
          {isExisting && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <Text strong className="text-blue-700 text-sm block">
                  Lô này đã có mã QR đang hoạt động
                </Text>
                <Text className="text-blue-600 text-xs">
                  Mã truy xuất: <strong>{qrData.traceCode}</strong>.
                </Text>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* QR Code SVG */}
            <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
              <div
                ref={qrContainerRef}
                className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center"
              >
                <QRCodeSVG
                  value={traceUrl}
                  size={200}
                  level="H"
                  marginSize={2}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
                <div className="mt-3 text-center">
                  <Text strong className="block text-sm text-green-700">
                    {batchDetail?.batchCode}
                  </Text>
                  <Text className="text-xs text-gray-500 font-medium">
                    {batchDetail?.cropName || batchDetail?.cropType || "Lô thu hoạch"}
                  </Text>
                </div>
              </div>
            </div>

            {/* Trace Code Box */}
            <div className="text-center bg-green-50/60 p-3 rounded-xl border border-green-100">
              <Text className="text-xs text-gray-500 block mb-1">
                Mã truy xuất
              </Text>
              <Text strong className="text-base text-green-800 font-mono">
                {currentTraceCode}
              </Text>
            </div>

            {/* Display Options Tags */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Text className="text-xs text-gray-500 block mb-2 font-medium">
                Hiển thị khi quét QR:
              </Text>
              <div className="flex flex-wrap gap-1.5">
                <Tag
                  color={showDailyLog ? "blue" : "default"}
                  className="rounded-full text-xs"
                >
                  {showDailyLog ? "✓ Nhật ký" : "✕ Nhật ký"}
                </Tag>
                <Tag
                  color={showMaterials ? "orange" : "default"}
                  className="rounded-full text-xs"
                >
                  {showMaterials ? "✓ Vật tư" : "✕ Vật tư"}
                </Tag>
                <Tag
                  color={showPhotos ? "green" : "default"}
                  className="rounded-full text-xs"
                >
                  {showPhotos ? "✓ Ảnh thực địa" : "✕ Ảnh thực địa"}
                </Tag>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                type="primary"
                size="large"
                block
                icon={<DownloadOutlined />}
                onClick={onDownload}
                className="h-11 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
              >
                Tải xuống mã QR (PNG)
              </Button>

              <Row gutter={12}>
                <Col span={12}>
                  <Button
                    size="large"
                    block
                    icon={<PrinterOutlined />}
                    onClick={onPrint}
                    className="h-11 rounded-xl"
                  >
                    In mã QR
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    block
                    icon={<CopyOutlined />}
                    onClick={onCopy}
                    className="h-11 rounded-xl"
                  >
                    Sao chép link
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div
            className={`w-20 h-20 ${
              !isQrEligible
                ? "bg-amber-50 text-amber-600 border-amber-100"
                : "bg-green-50 text-green-600 border-green-100"
            } rounded-2xl flex items-center justify-center mb-4 shadow-sm border`}
          >
            <QrcodeOutlined className="text-4xl" />
          </div>
          <Text strong className="text-gray-800 text-lg mb-1">
            {!isQrEligible
              ? "Lô chưa đủ điều kiện tạo QR"
              : "Chưa tạo mã QR chính thức"}
          </Text>
          <Paragraph className="text-xs text-gray-500 max-w-xs mb-0">
            {!isQrEligible
              ? "Lô hàng này chưa được hệ thống cho phép tạo QR."
              : 'Bấm nút "Tạo mã QR chính thức" để sinh mã QR cho lô thu hoạch này.'}
          </Paragraph>
        </div>
      )}
    </Card>
  )
}

export default QrResultCard
