import { useQuery } from '@tanstack/react-query'
import CropManagementService from 'src/services/CropManagementService'

export const useCropOptions = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['crops-selection'],
    queryFn: async () => {
      const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000 })
      const payload = response?.data ?? response ?? {}
      const items = Array.isArray(payload)
        ? payload
        : payload?.items || payload?.crops || payload?.cropCatalogs || []
      return items
        .filter((c) => c.isActive !== false)
        .map((c) => ({
          value: c.id,
          label: c.name,
        }))
    },
    staleTime: 5 * 60 * 1000,
  })

  return { cropOptions: data || [], isCropsLoading: isLoading }
}
