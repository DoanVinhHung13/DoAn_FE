import { useState, useCallback } from 'react'
import { message } from 'antd'
import { invalidCharsRegex } from 'src/utils/helpers'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'

/**
 * Custom hook for managing common list page state and handlers
 * 
 * Consolidates repeated patterns across list management pages:
 * - Search state (input + applied search)
 * - Pagination (page + pageSize)
 * - Filters (dynamic filters object)
 * - Data (listData + totalRecords)
 * - Loading state
 * 
 * Usage:
 * ```javascript
 * const {
 *   searchInput, setSearchInput, search, handleSearch, handleClearSearch,
 *   page, setPage, pageSize, setPageSize,
 *   filters, updateFilter,
 *   listData, setListData, totalRecords, setTotalRecords,
 *   loading, setLoading
 * } = useListManagement({ initialPageSize: 20, initialFilters: { status: 'all' } })
 * ```
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.initialPageSize - Initial page size (default: DEFAULT_PAGE_SIZE)
 * @param {Object} options.initialFilters - Initial filters object (default: {})
 * @returns {Object} State and handlers for list management
 */
export const useListManagement = (options = {}) => {
  const {
    initialPageSize = DEFAULT_PAGE_SIZE,
    initialFilters = {},
  } = options

  // ── Search State ────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // ── Filters ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(initialFilters)

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
    setPage(1)
  }, [initialFilters])

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

    // Filters
    filters,
    setFilters,
    updateFilter,
    resetFilters,

    // Data
    listData,
    setListData,
    totalRecords,
    setTotalRecords,

    // Loading
    loading,
    setLoading,
  }
}

export default useListManagement
