import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Modal, message } from "antd"
import HarvestBatchService from "src/services/HarvestBatchService"
import QrCodeService from "src/services/QrCodeService"
import { parseDate } from "src/utils/dateFormatters"
import {
  downloadQrAsPng,
  getPublicTraceUrl,
  printQrCode,
  unwrap,
} from "../components/qrHelpers"

export const useQrManagement = (form, batchIdFromUrl) => {
  const qrContainerRef = useRef(null)

  const [batchDetail, setBatchDetail] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPending, setPreviewPending] = useState(false)
  const [createPending, setCreatePending] = useState(false)

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

        form.setFieldsValue({
          harvestBatchId: String(detail.id),
          batchCode: detail.batchCode || "",
          cropName: detail.cropName || detail.cropType || "",
          startDate: detail.startDate ? parseDate(detail.startDate) : null,
          harvestDate: detail.harvestDate
            ? parseDate(detail.harvestDate)
            : null,
        })

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

  useEffect(() => {
    if (batchIdFromUrl) {
      form.setFieldsValue({ harvestBatchId: String(batchIdFromUrl) })
      fetchBatchDetail(batchIdFromUrl)
    }
  }, [batchIdFromUrl, form, fetchBatchDetail])

  const handlePreview = async () => {
    try {
      const values = await form.validateFields(["harvestBatchId"])
      const displayOptions = {
        showDailyLog: !!form.getFieldValue("showDailyLog"),
        showMaterials: !!form.getFieldValue("showMaterials"),
        showPhotos: !!form.getFieldValue("showPhotos"),
      }

      setPreviewPending(true)
      try {
        const response = await QrCodeService.previewQrCode({
          harvestBatchId: values.harvestBatchId,
          batchCode: batchDetail?.batchCode,
          displayOptions,
        })
        const data = unwrap(response)
        const traceCode =
          data?.traceCode ||
          qrData?.traceCode ||
          batchDetail?.activeTraceCode ||
          (batchDetail?.batchCode
            ? `TR-${batchDetail.batchCode}`
            : "TR-PREVIEW")
        setPreviewData({
          ...data,
          traceCode,
          qrImageDataUrl: data?.qrImageDataUrl,
          qrCodeUrl: data?.qrCodeUrl || getPublicTraceUrl(traceCode),
          traceability: data?.traceability,
          displayOptions: data?.displayOptions || displayOptions,
          harvestBatchId: values.harvestBatchId,
          isPreview: true,
        })
        setPreviewModalOpen(true)
      } catch {
        // Fallback: nếu API preview gặp lỗi, vẫn mở preview với mã trace và link dự kiến
        const fallbackTraceCode =
          qrData?.traceCode ||
          batchDetail?.activeTraceCode ||
          (batchDetail?.batchCode
            ? `TR-${batchDetail.batchCode}`
            : "TR-PREVIEW")
        setPreviewData({
          traceCode: fallbackTraceCode,
          qrCodeUrl: getPublicTraceUrl(fallbackTraceCode),
          displayOptions,
          harvestBatchId: values.harvestBatchId,
          isPreview: true,
        })
        setPreviewModalOpen(true)
      } finally {
        setPreviewPending(false)
      }
    } catch {
      message.warning("Vui lòng chọn lô thu hoạch trước khi xem preview!")
    }
  }

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

  const handleCreateQR = async () => {
    try {
      const values = await form.validateFields(["harvestBatchId"])
      const displayOptions = {
        showDailyLog: !!form.getFieldValue("showDailyLog"),
        showMaterials: !!form.getFieldValue("showMaterials"),
        showPhotos: !!form.getFieldValue("showPhotos"),
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
              traceCode:
                data?.traceCode || payload?.traceCode || currentTraceCode,
              harvestBatchId: values.harvestBatchId,
              createdAt: new Date().toISOString(),
            })
            await fetchBatchDetail(values.harvestBatchId)
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

  return {
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
  }
}
