import { useState, useCallback } from 'react'
import { areaToHectares } from 'src/utils/geoJsonUtils'

// ── Giới hạn upload ảnh ──────────────────────────────────────────────────────

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


  // ── Submit state ───────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSaving = isSubmitting

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
  /**
   * Upload ảnh giấy chứng nhận lên server.
   * @returns {Promise<string|null>} URL ảnh hoặc null nếu không có file
   */
  // ── Khởi tạo preview từ dữ liệu có sẵn (dùng cho Edit) ───────────────────

  /**
   * Set preview ảnh từ URL có sẵn (khi load dữ liệu cũ).
   */
  return {
    // State
    polygonData,
    mapError,
    isSubmitting,
    isSaving,

    // Setters (cho trường hợp cần set trực tiếp)
    setMapError,
    setIsSubmitting,

    // Handlers
    handlePolygonChange,
  }
}
