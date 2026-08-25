import { ArrowLeftOutlined, QrcodeOutlined } from "@ant-design/icons"
import { Button, Card, Col, Form, Row, Typography } from "antd"
import { useNavigate, useSearchParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import ROUTER from "src/router/ROUTER"

import BatchInfoFormCard from "./components/BatchInfoFormCard"
import DisplayOptionsCard from "./components/DisplayOptionsCard"
import QrPreviewModal from "./components/QrPreviewModal"
import QrResultCard from "./components/QrResultCard"
import { useQrManagement } from "./hooks/useQrManagement"

const { Paragraph } = Typography

const QRManagement = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const batchIdFromUrl = searchParams.get("batchId")

  const showDailyLog = Form.useWatch("showDailyLog", form)
  const showMaterials = Form.useWatch("showMaterials", form)
  const showPhotos = Form.useWatch("showPhotos", form)

  const {
    qrContainerRef,
    batchDetail,
    qrData,
    previewData,
    previewModalOpen,
    setPreviewModalOpen,
    previewPending,
    createPending,
    currentTraceCode,
    traceUrl,
    previewTraceUrl,
    handlePreview,
    handleCreateQR,
    handleDownload,
    handlePrint,
    handleCopyLink,
  } = useQrManagement(form, batchIdFromUrl)

  const displayOptionsDisabled = Boolean(qrData)

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_HARVEST_BATCHES)}
            className="h-10 rounded-xl"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <QrcodeOutlined className="text-2xl text-green-600" />
            Quản lý mã QR
          </TitleCustom>
        </div>
      </div>

      {/* ── Description Note ── */}
      <Card className="bg-green-50/70 border-green-200 rounded-2xl shadow-sm">
        <Paragraph className="mb-0 text-gray-700">
          Mã QR được tạo chuẩn hoá theo từng lô thu hoạch. Tùy chỉnh chọn các
          mục thông tin bên dưới và nhấn{" "}
          <strong>"Tạo mã QR chính thức"</strong> để sinh mã cho người tiêu dùng.
        </Paragraph>
      </Card>

      {/* ── Main Row ── */}
      <Row gutter={24}>
        {/* Left Column: Form & Display Options */}
        <Col xs={24} lg={13}>
          <BatchInfoFormCard form={form} />

          <DisplayOptionsCard
            form={form}
            batchDetail={batchDetail}
            disabledOptions={displayOptionsDisabled}
            createPending={createPending}
            previewPending={previewPending}
            onCreateQR={handleCreateQR}
            onPreviewQR={handlePreview}
          />
        </Col>

        {/* Right Column: QR Result Card */}
        <Col xs={24} lg={11}>
          <QrResultCard
            qrData={qrData}
            batchDetail={batchDetail}
            currentTraceCode={currentTraceCode}
            traceUrl={traceUrl}
            qrContainerRef={qrContainerRef}
            showDailyLog={showDailyLog}
            showMaterials={showMaterials}
            showPhotos={showPhotos}
            onDownload={handleDownload}
            onPrint={handlePrint}
            onCopy={handleCopyLink}
          />
        </Col>
      </Row>

      {/* ── Modal Preview Trace ── */}
      <QrPreviewModal
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        previewData={previewData}
        previewTraceUrl={previewTraceUrl}
        batchCode={batchDetail?.batchCode}
      />
    </div>
  )
}

export default QRManagement
