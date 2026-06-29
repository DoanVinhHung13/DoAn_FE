import { useState, useCallback } from 'react'
import { message, Upload } from 'antd'
import UploadService from 'src/services/UploadService'
import { areaToHectares } from 'src/utils/geoJsonUtils'

// ── Giới hạn upload ảnh ──────────────────────────────────────────────────────
const MAX_IMAGE_SIZE_MB = 5

/**
 * Custom hook quản lý logic form chung giữa LandPlotCreate và LandPlotEdit.
 * Bao gồm: polygon change, upload ảnh, preview ảnh.
 *
 * @param {Object}   form         - Instance Ant Design Form
 * @param {Object}   [options]
 * @param {string}   [options.defaultAreaUnit='ha'] - Đơn vị diện tích mặc định
 * @returns {Object} State & handlers cho form
 */
export const useLandPlotForm = (form, { defaultAreaUnit = 'ha' } = {}) => {
  // ── Polygon state ──────────────────────────────────────────────────────────
  const [polygonData, setPolygonData] = useState(null)
  const [mapError, setMapError] = useState('')

  // ── Upload state ───────────────────────────────────────────────────────────
  const [certFile, setCertFile] = useState(null)
  const [certPreview, setCertPreview] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // ── Submit state ───────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSaving = isSubmitting || isUploading

  // ── Polygon handlers ───────────────────────────────────────────────────────

  /**
   * Callback khi polygon thay đổi trên bản đồ (vẽ mới hoặc chỉnh sửa).
   * Tự động cập nhật diện tích trong form.
   */
  const handlePolygonChange = useCallback(
    (data) => {
      setMapError('')
      setPolygonData(data)
      if (data?.areaM2) {
        const currentUnit = form.getFieldValue('areaUnit') || defaultAreaUnit
        const area =
          currentUnit === 'm2'
            ? Number(data.areaM2.toFixed(2))
            : areaToHectares(data.areaM2)
        form.setFieldsValue({ area })
      }
    },
    [form, defaultAreaUnit],
  )

  // ── Upload handlers ────────────────────────────────────────────────────────

  /**
   * Validate và preview ảnh giấy chứng nhận trước khi upload.
   * Trả về `false` để ngăn Ant Design upload tự động.
   */
  const handleBeforeUpload = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Chỉ chấp nhận file ảnh!')
      return Upload.LIST_IGNORE
    }
    if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE_MB) {
      message.error(`Kích thước ảnh phải nhỏ hơn ${MAX_IMAGE_SIZE_MB}MB!`)
      return Upload.LIST_IGNORE
    }

    setCertFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setCertPreview(e.target.result)
    reader.readAsDataURL(file)
    return false
  }, [])

  /**
   * Upload ảnh giấy chứng nhận lên server.
   * @returns {Promise<string|null>} URL ảnh hoặc null nếu không có file
   */
  const uploadCertImage = useCallback(async () => {
    if (!certFile) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', certFile)
      const uploadRes = await UploadService.uploadImage(formData, { skipNotice: true })
      return uploadRes?.data?.url || uploadRes?.url || null
    } finally {
      setIsUploading(false)
    }
  }, [certFile])

  // ── Khởi tạo preview từ dữ liệu có sẵn (dùng cho Edit) ───────────────────

  /**
   * Set preview ảnh từ URL có sẵn (khi load dữ liệu cũ).
   */
  const initCertPreview = useCallback((imageUrl) => {
    setCertPreview(imageUrl || '')
    setCertFile(null)
  }, [])

  return {
    // State
    polygonData,
    mapError,
    certPreview,
    isSubmitting,
    isUploading,
    isSaving,

    // Setters (cho trường hợp cần set trực tiếp)
    setMapError,
    setIsSubmitting,

    // Handlers
    handlePolygonChange,
    handleBeforeUpload,
    uploadCertImage,
    initCertPreview,
  }
}
