import { useCallback, useState } from "react"
import { MEASUREMENT_UNITS } from "src/constants/measurementUnits"

/**
 * Custom hook quản lý logic form chung giữa LandPlotCreate và LandPlotEdit.
 * Bao gồm: polygon change, upload ảnh, preview ảnh.
 */
export const useLandPlotForm = form => {
  const [polygonData, setPolygonData] = useState(null)
  const [mapError, setMapError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasFormErrors, setHasFormErrors] = useState(false)
  const isSaving = isSubmitting

  const handleFieldsChange = useCallback((_, allFields) => {
    const hasErrors = allFields.some(
      field => field.errors && field.errors.length > 0,
    )
    setHasFormErrors(hasErrors)
  }, [])

  /**
   * Callback khi polygon thay đổi trên bản đồ (vẽ mới hoặc chỉnh sửa).
   * Tự động cập nhật diện tích trong form.
   */
  const handlePolygonChange = useCallback(
    data => {
      setMapError("")
      setPolygonData(data)
      if (data?.areaM2) {
        form.setFieldsValue({
          area: Number(data.areaM2.toFixed(2)),
          areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
        })
        form
          .validateFields(["area"])
          .then(() => {
            const errors = form.getFieldsError().some(f => f.errors?.length > 0)
            setHasFormErrors(errors)
          })
          .catch(() => {
            setHasFormErrors(true)
          })
      }
    },
    [form],
  )

  return {
    polygonData,
    mapError,
    isSubmitting,
    isSaving,
    hasFormErrors,
    setHasFormErrors,
    handleFieldsChange,
    setMapError,
    setIsSubmitting,
    handlePolygonChange,
  }
}
