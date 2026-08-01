import { useState, useCallback } from 'react'

/**
 * Custom hook for managing async operations with loading state
 * 
 * Simplifies the pattern of:
 * - setLoading(true)
 * - try { await asyncFn() }
 * - catch (error) { ... }
 * - finally { setLoading(false) }
 * 
 * @returns {Object} { execute, loading, error }
 * 
 * @example
 * const { execute: fetchData, loading, error } = useAsync()
 * 
 * const loadList = useCallback(async () => {
 *   const result = await execute(() => SomeService.getAll(params))
 *   if (result) {
 *     setListData(result.data.items)
 *   }
 * }, [execute])
 */
export const useAsync = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (asyncFunction) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFunction()
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return { execute, loading, error, reset }
}

/**
 * Custom hook for managing modal open/close state
 * 
 * Simplifies modal state management with convenient handlers
 * 
 * @param {boolean} initialState - Initial open state (default: false)
 * @returns {Object} { isOpen, open, close, toggle }
 * 
 * @example
 * const { isOpen, open, close } = useModalState()
 * 
 * return (
 *   <>
 *     <Button onClick={open}>Open Modal</Button>
 *     <Modal open={isOpen} onCancel={close}>...</Modal>
 *   </>
 * )
 */
export const useModalState = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return { isOpen, open, close, toggle, setIsOpen }
}

/**
 * Custom hook for managing table row selection
 * 
 * @param {Array} initialSelection - Initial selected row keys (default: [])
 * @returns {Object} Selection state and handlers
 * 
 * @example
 * const { selectedKeys, toggleRow, selectAll, clearSelection } = useTableSelection()
 * 
 * <Table
 *   rowSelection={{
 *     selectedRowKeys: selectedKeys,
 *     onChange: (keys) => setSelectedKeys(keys)
 *   }}
 * />
 */
export const useTableSelection = (initialSelection = []) => {
  const [selectedKeys, setSelectedKeys] = useState(initialSelection)

  const toggleRow = useCallback((key) => {
    setSelectedKeys(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }, [])

  const selectAll = useCallback((keys) => {
    setSelectedKeys(keys)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedKeys([])
  }, [])

  const isSelected = useCallback((key) => {
    return selectedKeys.includes(key)
  }, [selectedKeys])

  return {
    selectedKeys,
    setSelectedKeys,
    toggleRow,
    selectAll,
    clearSelection,
    isSelected,
  }
}

/**
 * Custom hook for managing pagination state
 * 
 * @param {Object} options - Configuration
 * @param {number} options.initialPage - Initial page (default: 1)
 * @param {number} options.initialPageSize - Initial page size (default: 10)
 * @returns {Object} Pagination state and handlers
 * 
 * @example
 * const { page, pageSize, setPage, setPageSize, reset, queryParams } = usePagination()
 * 
 * useEffect(() => {
 *   fetchData(queryParams) // { PageIndex: 1, PageSize: 10 }
 * }, [queryParams])
 */
export const usePagination = (options = {}) => {
  const { initialPage = 1, initialPageSize = 10 } = options

  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const reset = useCallback(() => {
    setPage(initialPage)
    setPageSize(initialPageSize)
  }, [initialPage, initialPageSize])

  const goToPage = useCallback((newPage) => {
    setPage(newPage)
  }, [])

  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  const queryParams = {
    PageIndex: page,
    PageSize: pageSize,
  }

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    goToPage,
    changePageSize,
    reset,
    queryParams,
  }
}

export default { useAsync, useModalState, useTableSelection, usePagination }
