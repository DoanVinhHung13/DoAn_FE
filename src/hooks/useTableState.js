import { useState, useCallback } from 'react'
import { usePagination } from './usePagination'
import { useSearchInput } from './useSearchInput'

export const useTableState = (defaultPageSize) => {
  const pagination = usePagination(defaultPageSize)
  const [filters, setFilters] = useState({})
  
  const search = useSearchInput((searchValue) => {
    pagination.reset()
  })

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    pagination.reset()
  }, [pagination])

  const resetFilters = useCallback(() => {
    setFilters({})
    search.clear()
    pagination.reset()
  }, [search, pagination])

  return {
    pagination,
    search,
    filters,
    updateFilter,
    resetFilters,
  }
}
