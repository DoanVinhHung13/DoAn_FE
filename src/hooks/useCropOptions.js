import { useState, useEffect } from "react"
import CropManagementService from "src/services/CropManagementService"
import { isActiveCropCatalog } from "src/utils/cropCatalog"

export const useCropOptions = () => {
  const [cropOptions, setCropOptions] = useState([])
  const [isCropsLoading, setIsCropsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    CropManagementService.getCrops({ PageIndex: 1, PageSize: 100 })
      .then(response => {
        if (cancelled) return
        const payload = response?.data ?? response ?? {}
        const items = Array.isArray(payload)
          ? payload
          : payload?.items || payload?.crops || payload?.cropCatalogs || []
        setCropOptions(
          items
            .filter(isActiveCropCatalog)
            .map(c => ({ value: c.id, label: c.name })),
        )
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsCropsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { cropOptions, isCropsLoading }
}
