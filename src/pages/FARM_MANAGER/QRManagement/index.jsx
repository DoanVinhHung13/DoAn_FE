import { ArrowLeftOutlined, QrcodeOutlined } from "@ant-design/icons"
import { Button, Card, Col, Form, Modal, Row, Typography, message } from "antd"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import ROUTER from "src/router/ROUTER"
import HarvestBatchService from "src/services/HarvestBatchService"
import QrCodeService from "src/services/QrCodeService"
import { parseDate } from "src/utils/dateFormatters"

import BatchInfoFormCard from "./components/BatchInfoFormCard"
import DisplayOptionsCard from "./components/DisplayOptionsCard"
import QrPreviewModal from "./components/QrPreviewModal"
import QrResultCard from "./components/QrResultCard"
import {
  downloadQrAsPng,
  getPublicTraceUrl,
  printQrCode,
  unwrap,
} from "./components/qrHelpers"

const { Paragraph } = Typography

const QRManagement = () => {
  // ── 1. Declarations & States ──────────────────────────────────────────────
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm()
  const qrContainerRef = useRef(null)

  const batchIdFromUrl = searchParams.get("batchId")
  const selectedBatchId = Form.useWatch("harvestBatchId", form)
  const showDailyLog = Form.useWatch("showDailyLog", form)
  const showMaterials = Form.useWatch("showMaterials", form)
  const showPhotos = Form.useWatch("showPhotos", form)

  const [batchDetail, setBatchDetail] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPending, setPreviewPending] = useState(false)
  const [createPending, setCreatePending] = useState(false)

  // ── 2. Functions & Handlers ───────────────────────────────────────────────
  const fetchBatchDetail = useCallback(
    async batchId => {
      if (!batchId) {
        setBatchDetail(null)
        setQrData(null)
        return
      }
      try {
        const response = await HarvestBatchService.getHarvestBatchById(batchId)
        const detail = unwrap(response)
        setBatchDetail(detail)

        // Populate Form
        form.setFieldsValue({
          harvestBatchId: String(detail.id),
          batchCode: detail.batchCode || "",
          cropName: detail.cropName || detail.cropType || "",
          startDate: detail.startDate ? parseDate(detail.startDate) : null,
          harvestDate: detail.harvestDate ? parseDate(detail.harvestDate) : null,
        })

        // Check if batch already has active QR
        if (detail.hasActiveQrCode) {
          try {
            const qrRes = await QrCodeService.getQrCodes({
              BatchId: batchId,
              PageSize: 1,
            })
            const list = qrRes?.data?.items || qrRes?.data?.data?.items || []
            const existingQR = list[0] || null

            setQrData({
              ...existingQR,
              traceCode:
                detail.activeTraceCode ||
                existingQR?.traceCode ||
                existingQR?.code ||
                `QR-${detail.batchCode}`,
              harvestBatchId: batchId,
              isExisting: true,
            })
          } catch {
            setQrData({
              traceCode: detail.activeTraceCode || `QR-${detail.batchCode}`,
              harvestBatchId: batchId,
              isExisting: true,
            })
          }
        } else {
          setQrData(null)
        }
      } catch {
        setBatchDetail(null)
        setQrData(null)
      }
    },
    [form],
  )

  const handlePreview = async () => {
    try {
      const values = await form.validateFields(["harvestBatchId"])
      const displayOptions = {
        showDailyLog: !!showDailyLog,
        showMaterials: !!showMaterials,
        showPhotos: !!showPhotos,
      }

      setPreviewPending(true)
      try {
        const response = await QrCodeService.previewQrCode({
          harvestBatchId: values.harvestBatchId,
          displayOptions,
        })
        const data = unwrap(response)
        setPreviewData({
          ...data,
          traceCode: data?.traceCode,
          qrImageDataUrl: data?.qrImageDataUrl,
          qrCodeUrl: data?.qrCodeUrl,
          traceability: data?.traceability,
          displayOptions: data?.displayOptions || displayOptions,
          harvestBatchId: values.harvestBatchId,
          isPreview: true,
        })
        setPreviewModalOpen(true)
      } catch {
        setPreviewData(null)
        setPreviewModalOpen(false)
      } finally {
        setPreviewPending(false)
      }
    } catch {
      message.warning("Vui lòng chọn lô thu hoạch trước khi xem preview!")
    }
  }

  const handleCreateQR = async () => {
    try {
      const values = await form.validateFields(["harvestBatchId"])
      const displayOptions = {
        showDailyLog: !!showDailyLog,
        showMaterials: !!showMaterials,
        showPhotos: !!showPhotos,
      }

      const payload = {
        harvestBatchId: values.harvestBatchId,
        traceCode:
          previewData?.harvestBatchId === values.harvestBatchId
            ? previewData?.traceCode
            : undefined,
        displayOptions:
          previewData?.harvestBatchId === values.harvestBatchId
            ? previewData?.displayOptions
            : displayOptions,
      }

      Modal.confirm({
        title: "Xác nhận tạo mã QR chính thức",
        content: (
          <div>
            <p>Bạn có chắc chắn muốn tạo mã QR cho lô thu hoạch này?</p>
            {!previewData && (
              <p className="text-orange-500 text-sm mt-1">
                Lưu ý: Bạn chưa xem trước mã QR. Khuyến nghị xem trước để kiểm
                tra thông tin hiển thị trước khi tạo chính thức.
              </p>
            )}
          </div>
        ),
        okText: "Tạo mã",
        cancelText: "Hủy",
        onOk: async () => {
          setCreatePending(true)
          try {
            const response = await QrCodeService.createQrCode(payload)
            const data = unwrap(response)
            setQrData({
              ...data,
              traceCode: data?.traceCode || payload?.traceCode || currentTraceCode,
              harvestBatchId: selectedBatchId,
              createdAt: new Date().toISOString(),
            })
            // Reload batch detail
            await fetchBatchDetail(selectedBatchId)
          } finally {
            setCreatePending(false)
          }
        },
      })
    } catch {
      message.warning("Vui lòng chọn lô thu hoạch!")
    }
  }

  const handleDownload = () => {
    const svgElement = qrContainerRef.current?.querySelector("svg")
    downloadQrAsPng(svgElement, batchDetail?.batchCode, currentTraceCode)
  }

  const handlePrint = () => {
    const svgElement = qrContainerRef.current?.querySelector("svg")
    printQrCode(svgElement, batchDetail?.batchCode, currentTraceCode)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(traceUrl)
    message.success("Đã sao chép liên kết truy xuất!")
  }

  // ── 3. useEffects ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (batchIdFromUrl) {
      form.setFieldsValue({ harvestBatchId: String(batchIdFromUrl) })
      fetchBatchDetail(batchIdFromUrl)
    }
  }, [batchIdFromUrl, form, fetchBatchDetail])

  // ── 4. Derived Values & Render ────────────────────────────────────────────
  const currentTraceCode = useMemo(() => {
    return (
      qrData?.traceCode ||
      previewData?.traceCode ||
      (batchDetail?.batchCode ? `TR-${batchDetail.batchCode}` : "TR-PREVIEW")
    )
  }, [qrData, previewData, batchDetail])

  const traceUrl = useMemo(() => {
    return getPublicTraceUrl(currentTraceCode)
  }, [currentTraceCode])

  const previewTraceUrl = useMemo(() => {
    return previewData?.qrCodeUrl || getPublicTraceUrl(previewData?.traceCode)
  }, [previewData])

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
