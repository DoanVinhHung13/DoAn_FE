import { ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import {
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Skeleton,
  Typography,
} from "antd"
import { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import { ApprovalLogbookIcon } from "src/assets/icon/menu/MenuIcons"
import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import { canApproveClosing } from "src/utils/cultivationStatus"
import { useListManagement } from "src/hooks/useListManagement"
import ClosingReviewCard from "./components/ClosingReviewCard"
import { unwrap } from "./components/reviewHelpers"

const { Text } = Typography

const FarmManagerLogbooks = () => {
  const navigate = useNavigate()

  const {
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    listData: logbooks,
    setListData: setLogbooks,
    totalRecords,
    setTotalRecords,
    loading,
    setLoading,
  } = useListManagement({
    initialPageSize: 100,
    initialFilters: {},
  })

  const fetchLogbooks = async () => {
    try {
      setLoading(true)
      const res = await CultivationLogbookService.getClosingReviews({
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
      })
      const data = unwrap(res)
      const items = Array.isArray(data) ? data : data?.items || []
      setLogbooks(items)
      setTotalRecords(data?.totalItems ?? data?.totalCount ?? items.length)
    } catch {
      setLogbooks([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewLogbook = logbookId => {
    navigate(ROUTER.FM_LOGBOOK_REVIEW.replace(":id", logbookId))
  }

  const handlePageChange = (nextPage, nextPageSize) => {
    if (nextPageSize !== pageSize) {
      setPage(1)
      setPageSize(nextPageSize)
    } else {
      setPage(nextPage)
    }
  }

  useEffect(() => {
    fetchLogbooks()
  }, [page, pageSize, search])

  const visibleLogbooks = useMemo(() => {
    return logbooks.filter(canApproveClosing)
  }, [logbooks])

  return (
    <div className="admin-compact-list space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <ApprovalLogbookIcon style={{ fontSize: "24px", color: "#15803d" }} />
          Duyệt nhật ký canh tác
        </TitleCustom>
      </div>

      <div className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar flex flex-wrap items-center gap-2">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            onClear={handleSearch}
            placeholder="Tìm kiếm nhật ký..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="h-10 min-w-48 flex-1 rounded-xl"
            allowClear
          />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchLogbooks}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>
      </div>

      <Card
        variant="borderless"
        className="admin-data-card overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        {loading ? (
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : visibleLogbooks.length > 0 ? (
          <div>
            <div className="p-5 grid gap-4 xl:grid-cols-2">
              {visibleLogbooks.map(logbook => (
                <ClosingReviewCard
                  key={logbook.id}
                  logbook={logbook}
                  onReview={handleReviewLogbook}
                />
              ))}
            </div>
            <div className="flex justify-end border-t border-gray-100 px-5 py-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalRecords}
                showSizeChanger
                onChange={handlePageChange}
              />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có nhật ký nào cần duyệt."
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default FarmManagerLogbooks

