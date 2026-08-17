import { useState, useCallback, useMemo } from 'react'
import { message } from 'antd'
import { invalidCharsRegex } from 'src/utils/helpers'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'

export const useListManagement = (options = {}) => {
  const {
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialFilters = {},
    initialSort = '',
    enableClientFilter = false,
    filterFn = null,
    sortFn = null,
  } = options

  // ── Search State ────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // ── Filters & Sort ──────────────────────────────────────────────────────
  const [filters, setFilters] = useState(initialFilters)
  const [sortBy, setSortBy] = useState(initialSort)

  // ── Data ────────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)

  // ── Loading ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Handle search with validation
   * Validates against invalid characters and applies search
   */
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  /**
   * Clear search input and applied search
   */
  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }, [])

  /**
   * Update a single filter and reset to page 1
   * @param {string} key - Filter key
   * @param {any} value - Filter value
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  /**
   * Reset filters to initial values
   */
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setSortBy(initialSort)
    setPage(1)
  }, [initialFilters, initialSort])

  /**
   * Update sort value and reset to page 1
   */
  const updateSort = useCallback((value) => {
    setSortBy(value)
    setPage(1)
  }, [])

  /**
   * Client-side filtered data (only if enableClientFilter = true)
   */
  const filteredData = useMemo(() => {
    if (!enableClientFilter) return listData

    let result = [...listData]

    // Apply custom filter function
    if (filterFn) {
      result = result.filter(filterFn)
    }

    // Apply custom sort function
    if (sortFn && sortBy) {
      result = result.sort((a, b) => sortFn(a, b, sortBy))
    }

    return result
  }, [enableClientFilter, listData, filterFn, sortFn, sortBy])

  return {
    // Search
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Filters & Sort
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    sortBy,
    setSortBy,
    updateSort,

    // Data
    listData,
    setListData,
    totalRecords,
    setTotalRecords,
    filteredData,

    // Loading
    loading,
    setLoading,
  }
}

export default useListManagement
