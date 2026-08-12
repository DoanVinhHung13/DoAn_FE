/**
 * Farm Manager: Danh sách Nhật ký chờ chốt sổ
 * Route: /farm-manager/cultivation-logbooks/reviews
 *
 * API: GET /cultivation-logbooks/closing-reviews
 */
import {
  CalendarOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Input,
  Skeleton,
  Tag,
  Typography,
} from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import { ApprovalLogbookIcon } from 'src/assets/icon/menu/MenuIcons'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { canApproveClosing } from 'src/utils/cultivationStatus'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'
import { getLandPlotNamesDisplay } from 'src/utils/helpers'
import { useListManagement } from 'src/hooks/useListManagement'

const { Text } = Typography

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const FarmManagerLogbooks = () => {
  const navigate = useNavigate()
  const { getLogbookStatus, getReviewStatus } = useCultivationStatus()

  // ── Use List Management Hook ────────────────────────────────────────────────
  const {
    searchInput, setSearchInput, search, handleSearch,
    listData: logbooks, setListData: setLogbooks,
    loading, setLoading
  } = useListManagement({
    initialPageSize: 100,
    initialFilters: {}
  })

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const res = await CultivationLogbookService.getClosingReviews({
        PageIndex: 1,
        PageSize: 100,
        SearchKeyword: search || undefined,
      })
      const data = unwrap(res)
      const items = Array.isArray(data) ? data : data?.items || []
      setLogbooks(items)
    } catch {
      setLogbooks([])
    } finally {
      setLoading(false)
    }
  }, [search, setLoading, setLogbooks])

  useEffect(() => {
    getList()
  }, [getList])

  const visible = useMemo(() => {
    return logbooks.filter(canApproveClosing)
  }, [logbooks])

  return (
    <div className="admin-compact-list space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <ApprovalLogbookIcon style={{ fontSize: '24px', color: '#15803d' }} />
          Duyệt nhật ký canh tác
        </TitleCustom>
        <Text type="secondary" className="text-xs">
          Tìm thấy <strong>{visible.length}</strong> nhật ký
        </Text>
      </div>

      <div className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar flex flex-wrap items-center gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            onClear={handleSearch}
            placeholder="Tìm kiếm nhật ký..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="h-10 min-w-48 flex-1 rounded-xl"
            allowClear
          />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Tag color="gold" className="m-0 flex h-10 items-center rounded-xl px-3">
              Chờ duyệt
            </Tag>
            <Button
              icon={<ReloadOutlined />}
              onClick={getList}
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
        ) : visible.length ? (
          <div className="p-5 grid gap-4 xl:grid-cols-2">
            {visible.map((lb) => {
              const cfg = getLogbookStatus(lb.status)
              const reviewCfg = lb.reviewStatus ? getReviewStatus(lb.reviewStatus) : null
              const reviewId = lb.id
              return (
                <Card
                  key={reviewId}
                  bordered={false}
                  className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer transition"
                  bodyStyle={{ padding: 0 }}
                  onClick={() => navigate(ROUTER.FM_LOGBOOK_REVIEW.replace(':id', reviewId))}
                >
                  <div className="p-5 border-b bg-gradient-to-r from-green-50 to-white">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-2">
                        <Tag color={cfg.color} className="rounded-full">
                          {cfg.label}
                        </Tag>
                        {reviewCfg && (
                          <Tag color={reviewCfg.color} className="rounded-full">
                            Duyệt: {reviewCfg.label}
                          </Tag>
                        )}
                      </div>
                      <Text type="secondary" className="text-xs">
                        <CalendarOutlined className="mr-1" />
                        {lb.submittedAt ? formatDate(lb.submittedAt) : '—'}
                      </Text>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{lb.logbookName}</h3>
                    <Text type="secondary">{lb.cropName}</Text>
                  </div>
                  <div className="p-5 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <Text type="secondary">Vùng trồng</Text>
                      <div className="mt-1 font-semibold">
                        <EnvironmentOutlined className="mr-1 text-green-600" />
                        {getLandPlotNamesDisplay(lb)}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Giám sát trang trại</Text>
                      <div className="mt-1 font-semibold">
                        <UserOutlined className="mr-1 text-green-600" />
                        {lb.supervisorName}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(ROUTER.FM_LOGBOOK_REVIEW.replace(':id', reviewId))
                        }}
                        className="w-full h-9 font-semibold bg-green-600 rounded-lg"
                      >
                        Xem & Duyệt nhật ký
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="p-8">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có nhật ký nào cần duyệt." />
          </div>
        )}
      </Card>
    </div>
  )
}

export default FarmManagerLogbooks
