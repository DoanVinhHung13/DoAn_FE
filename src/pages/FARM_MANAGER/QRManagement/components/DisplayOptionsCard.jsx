import {
  CheckCircleOutlined,
  EyeOutlined,
  QrcodeOutlined,
  SafetyOutlined,
} from "@ant-design/icons"
import { Button, Card, Checkbox, Form, Typography } from "antd"

const { Text, Paragraph } = Typography

const DisplayOptionsCard = ({
  form,
  batchDetail,
  disabledOptions = false,
  createPending = false,
  previewPending = false,
  onCreateQR,
  onPreviewQR,
}) => {
  const isQrEligible = batchDetail?.isQrEligible === true
  const hasActiveQrCode = batchDetail?.hasActiveQrCode === true

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <EyeOutlined className="text-blue-600" />
          </div>
          <span className="text-lg font-semibold text-gray-800">
            Tùy chỉnh thông tin hiển thị
          </span>
        </div>
      }
      className="mt-6 rounded-2xl shadow-sm border-0"
    >
      <Paragraph className="mb-4 text-sm text-gray-600">
        Tích chọn các mục bên dưới. Khi khách hàng quét mã QR, hệ thống chỉ hiển
        thị đúng các thông tin được tích:
      </Paragraph>

      <Form form={form} component={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
          <Form.Item name="showDailyLog" valuePropName="checked" noStyle>
            <Checkbox
              disabled={disabledOptions}
              className="text-sm font-medium"
            >
              <span className="ml-1">📝 Nhật ký hàng ngày</span>
            </Checkbox>
          </Form.Item>

          <Form.Item name="showMaterials" valuePropName="checked" noStyle>
            <Checkbox
              disabled={disabledOptions}
              className="text-sm font-medium"
            >
              <span className="ml-1">🧪 Thông tin vật tư sử dụng</span>
            </Checkbox>
          </Form.Item>

          <Form.Item name="showPhotos" valuePropName="checked" noStyle>
            <Checkbox
              disabled={disabledOptions}
              className="text-sm font-medium"
            >
              <span className="ml-1">📷 Hình ảnh thực địa</span>
            </Checkbox>
          </Form.Item>
        </div>
      </Form>

      <div className="mt-6 space-y-3">
        {hasActiveQrCode ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <CheckCircleOutlined className="text-blue-500 flex-shrink-0" />
              <Text className="text-blue-700 text-sm">
                Mã QR đã được tạo và đang hoạt động
              </Text>
            </div>
            <Button
              type="dashed"
              size="large"
              block
              icon={<EyeOutlined />}
              onClick={onPreviewQR}
              loading={previewPending}
              className="h-11 rounded-xl text-blue-600 border-blue-400 hover:bg-blue-50 font-medium"
            >
              Xem trước QR
            </Button>
          </>
        ) : !isQrEligible ? (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <SafetyOutlined className="text-amber-600 text-lg flex-shrink-0" />
              <Text className="text-amber-800 text-xs font-medium">
                Lô thu hoạch này chưa đủ điều kiện tạo QR.
              </Text>
            </div>
            <Button
              size="large"
              block
              disabled
              icon={<QrcodeOutlined />}
              className="h-11 rounded-xl font-semibold"
            >
              Tạo mã QR
            </Button>
            <Button
              type="dashed"
              size="large"
              block
              icon={<EyeOutlined />}
              onClick={onPreviewQR}
              loading={previewPending}
              className="h-11 rounded-xl text-blue-600 border-blue-400 hover:bg-blue-50 font-medium"
            >
              Xem trước QR
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="primary"
              size="large"
              block
              icon={<QrcodeOutlined />}
              onClick={onCreateQR}
              loading={createPending}
              className="h-11 rounded-xl bg-green-600 hover:bg-green-700 font-semibold shadow-md shadow-green-100"
            >
              Tạo mã QR chính thức
            </Button>
            <Button
              type="dashed"
              size="large"
              block
              icon={<EyeOutlined />}
              onClick={onPreviewQR}
              loading={previewPending}
              className="h-11 rounded-xl text-blue-600 border-blue-400 hover:bg-blue-50 font-medium"
            >
              Xem trước QR
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

export default DisplayOptionsCard
