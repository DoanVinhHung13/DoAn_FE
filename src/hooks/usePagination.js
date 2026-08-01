import { useState, useCallback, useMemo } from 'react'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

export const usePagination = (defaultPageSize = DEFAULT_PAGE_SIZE) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [total, setTotal] = useState(0)

  const reset = useCallback(() => {
    setPage(1)
  }, [])

  const config = useMemo(() => ({
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: PAGE_SIZE,
    onChange: (p, ps) => {
      setPage(p)
      if (ps !== pageSize) {
        setPageSize(ps)
      }
    },
  }), [page, pageSize, total])

  return {
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
    setTotal,
    reset,
    config,
  }
}
