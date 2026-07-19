import {
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Input,
  Pagination,
  Select,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/CultivationLogbookService'
import ProductionStageService from 'src/services/ProductionStageService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

const itemsOf = (response) => {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  return Array.isArray(data) ? data : data?.items || []
}

const userIdOf = (user) => user?.id || user?._id || user?.userId
const supervisorIdOf = (plan) =>
  plan.assignedFarmSupervisorId ||
  plan.assignedFarmSupervisor?.id ||
  plan.farmSupervisor?.id

const mockPlanOf = (user) => ({
  ...MOCK_SUPERVISOR_PLAN,
  isMock: true,
  supervisorName:
    user?.fullName || user?.name || MOCK_SUPERVISOR_PLAN.supervisorName,
  stageCount: MOCK_SUPERVISOR_STAGES.length,
})

const statusOf = (status) => {
  const value = String(status || '').toUpperCase()
  if (['COMPLETED', 'DONE'].includes(value)) {
    return { color: 'success', label: 'Hoàn thành' }
  }
  if (['CANCELLED', 'INACTIVE'].includes(value)) {
    return { color: 'default', label: 'Ngừng hoạt động' }
  }
  return { color: 'processing', label: 'Đang canh tác' }
}

const FarmSupervisorLogbooks = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const currentUserId = userIdOf(user)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cropFilter, setCropFilter] = useState('all')
  const [landFilter, setLandFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [reloadKey, setReloadKey] = useState(0)
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('farm-supervisor-logbook-view') || 'card'
  )

  useEffect(() => {
    localStorage.setItem('farm-supervisor-logbook-view', viewMode)
  }, [viewMode])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        setLoading(true)
        const [planResponse, stageResponse] = await Promise.all([
          ProductionPlanService.getAll({ PageIndex: 1, PageSize: 1000 }),
          ProductionStageService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ])
        const planItems = itemsOf(planResponse)
        const allStages = itemsOf(stageResponse)
        const detailed = await Promise.all(
          planItems.map(async (plan) => {
            try {
              const response = await ProductionPlanService.getById(plan.id)
              return { ...plan, ...(response?.data ?? response) }
            } catch {
              return plan
            }
          })
        )
        if (!mounted) return

        const assignedPlans = detailed
          .filter(
            (plan) =>
              String(supervisorIdOf(plan) || '') ===
              String(currentUserId || '')
          )
          .map((plan) => ({
            ...plan,
            stageCount: allStages.filter(
              (stage) =>
                String(
                  stage.cultivationLogbookId ||
                    stage.productionPlanId ||
                    ''
                ) === String(plan.id)
            ).length,
          }))

        setPlans(
          assignedPlans.length || !import.meta.env.DEV
            ? assignedPlans
            : [mockPlanOf(user)]
        )
      } catch (error) {
        if (import.meta.env.DEV && mounted) {
          setPlans([mockPlanOf(user)])
          message.info('API chưa có dữ liệu. Đang hiển thị nhật ký mẫu.')
        } else {
          message.error(error.message || 'Không thể tải nhật ký được giao.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (currentUserId) load()
    else if (import.meta.env.DEV) {
      setPlans([mockPlanOf(user)])
      setLoading(false)
    } else setLoading(false)

    return () => {
      mounted = false
    }
  }, [currentUserId, reloadKey, user?.fullName, user?.name])

  const visiblePlans = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return plans.filter((plan) => {
      const matchesKeyword =
        !keyword ||
        [plan.planName, plan.cropName, plan.landPlotName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword))
      const normalizedStatus = statusOf(plan.status).label
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' &&
          normalizedStatus === 'Đang canh tác') ||
        (statusFilter === 'completed' &&
          normalizedStatus === 'Hoàn thành') ||
        (statusFilter === 'inactive' &&
          normalizedStatus === 'Ngừng hoạt động')
      const matchesCrop =
        cropFilter === 'all' || String(plan.cropName) === cropFilter
      const matchesLand =
        landFilter === 'all' || String(plan.landPlotName) === landFilter

      return matchesKeyword && matchesStatus && matchesCrop && matchesLand
    })
  }, [cropFilter, landFilter, plans, search, statusFilter])

  const cropOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả cây trồng' },
      ...Array.from(
        new Set(plans.map((plan) => plan.cropName).filter(Boolean))
      ).map((value) => ({ value, label: value })),
    ],
    [plans]
  )

  const landOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả vùng trồng' },
      ...Array.from(
        new Set(plans.map((plan) => plan.landPlotName).filter(Boolean))
      ).map((value) => ({ value, label: value })),
    ],
    [plans]
  )

  const pagedCards = useMemo(
    () => visiblePlans.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, visiblePlans]
  )

  const openDetail = (planId) =>
    navigate(ROUTER.FS_LOGBOOK_DETAIL.replace(':planId', planId))

  const handleSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Nhật ký canh tác',
      dataIndex: 'planName',
      key: 'planName',
      width: 220,
      render: (value, plan) => (
        <div>
          <div className="font-semibold text-gray-900">
            {value || 'Nhật ký chưa đặt tên'}
          </div>
          {plan.isMock && (
            <Tag color="blue" className="mt-1 rounded-full">
              Dữ liệu mẫu
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Cây trồng',
      dataIndex: 'cropName',
      key: 'cropName',
      width: 135,
      render: (value) => value || '—',
    },
    {
      title: 'Vùng trồng',
      dataIndex: 'landPlotName',
      key: 'landPlotName',
      width: 180,
      render: (value) => (
        <span>
          <EnvironmentOutlined className="mr-1 text-green-600" />
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 180,
      render: (_, plan) => (
        <span className="whitespace-nowrap">
          {plan.startDate ? formatDate(plan.startDate) : '—'} –{' '}
          {plan.expectedEndDate
            ? formatDate(plan.expectedEndDate)
            : '—'}
        </span>
      ),
    },
    {
      title: 'Giai đoạn',
      dataIndex: 'stageCount',
      key: 'stageCount',
      align: 'center',
      width: 95,
      render: (value) => `${value || 0} giai đoạn`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 135,
      render: (value) => {
        const status = statusOf(value)
        return (
          <div
            className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
              status.label === 'Đang canh tác'
                ? 'bg-green-50 text-green-700'
                : status.label === 'Hoàn thành'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-red-50 text-red-600'
            }`}
          >
            {status.label === 'Ngừng hoạt động' ? (
              <StopOutlined />
            ) : (
              <CheckCircleOutlined />
            )}
            {status.label}
          </div>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 85,
      render: (_, plan) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={(event) => {
            event.stopPropagation()
            openDetail(plan.id)
          }}
          className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
          title="Xem chi tiết"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <FileTextOutlined className="text-green-600" />
          Nhật ký canh tác được giao
        </TitleCustom>
        <Text type="secondary">
          Chọn một nhật ký để xem quy trình và ghi chép từng giai đoạn.
        </Text>
      </div>

      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onPressEnter={handleSearch}
              onClear={handleClearSearch}
              placeholder="Tìm kiếm nhật ký canh tác..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-full h-10 rounded-xl lg:w-64"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="h-10 min-w-40 rounded-xl"
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'active', label: 'Đang canh tác' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'inactive', label: 'Ngừng hoạt động' },
              ]}
            />
            <Select
              value={cropFilter}
              onChange={handleFilterChange(setCropFilter)}
              className="h-10 min-w-40 rounded-xl"
              options={cropOptions}
              showSearch
              optionFilterProp="label"
            />
            <Select
              value={landFilter}
              onChange={handleFilterChange(setLandFilter)}
              className="h-10 min-w-40 rounded-xl"
              options={landOptions}
              showSearch
              optionFilterProp="label"
            />

            <div className="flex flex-wrap gap-2 lg:ml-auto">
              <Button
                onClick={handleSearch}
                icon={<SearchOutlined />}
                className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setReloadKey((value) => value + 1)}
                loading={loading}
                className="h-10 px-3 rounded-xl bg-gray-50"
                title="Làm mới dữ liệu"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Text type="secondary" className="text-xs">
              Tìm thấy <strong>{visiblePlans.length}</strong> nhật ký
            </Text>
            <div className="inline-flex overflow-hidden border border-gray-200 shadow-sm rounded-lg">
              <Button
                type={viewMode === 'table' ? 'primary' : 'text'}
                icon={<UnorderedListOutlined />}
                onClick={() => {
                  setViewMode('table')
                  setPage(1)
                }}
                className={`h-9 rounded-none border-0 px-4 text-sm font-semibold ${
                  viewMode === 'table'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:!bg-green-50 hover:!text-green-700'
                }`}
              >
                Xem ở dạng bảng
              </Button>
              <Button
                type={viewMode === 'card' ? 'primary' : 'text'}
                icon={<AppstoreOutlined />}
                onClick={() => {
                  setViewMode('card')
                  setPage(1)
                }}
                className={`h-9 rounded-none border-0 px-4 text-sm font-semibold ${
                  viewMode === 'card'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-600 hover:!bg-green-50 hover:!text-green-700'
                }`}
              >
                Xem ở dạng thẻ
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : viewMode === 'table' ? (
          <CustomTable
            rowKey="id"
            columns={columns}
            dataSource={visiblePlans}
            scroll={{ x: 1090 }}
            onRow={(plan) => ({
              onClick: () => openDetail(plan.id),
              className: 'cursor-pointer',
            })}
            rowClassName="hover:bg-green-50/30 transition-colors"
            locale={{
              emptyText: 'Không có nhật ký phù hợp với bộ lọc.',
            }}
            pagination={{
              current: page,
              pageSize,
              total: visiblePlans.length,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZE,
              showTotal: (total, range) => (
                <span className="text-xs text-gray-500">
                  {range[0]}–{range[1]} / <strong>{total}</strong>
                </span>
              ),
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
            }}
          />
        ) : visiblePlans.length ? (
          <div className="p-5">
            <div className="grid gap-4 xl:grid-cols-2">
              {pagedCards.map((plan) => {
                const status = statusOf(plan.status)
                return (
                  <Card
                    key={plan.id}
                    bordered={false}
                    className="overflow-hidden transition border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md"
                    bodyStyle={{ padding: 0 }}
                  >
                    <div className="p-5 border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Tag color={status.color} className="rounded-full">
                          {status.label}
                        </Tag>
                        {plan.isMock && (
                          <Tag color="blue" className="rounded-full">
                            Dữ liệu mẫu cho Backend
                          </Tag>
                        )}
                      </div>
                      <h2 className="mt-3 mb-1 text-lg font-bold text-gray-900">
                        {plan.planName || 'Nhật ký chưa đặt tên'}
                      </h2>
                      <Text type="secondary">
                        {plan.cropName || 'Chưa có cây trồng'}
                      </Text>
                    </div>

                    <div className="p-5">
                      <div className="grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <Text type="secondary">Vùng trồng</Text>
                          <div className="mt-1 font-semibold">
                            <EnvironmentOutlined className="mr-1 text-green-600" />
                            {plan.landPlotName || '—'}
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">Người giám sát</Text>
                          <div className="mt-1 font-semibold">
                            <UserOutlined className="mr-1 text-green-600" />
                            {plan.supervisorName ||
                              user?.fullName ||
                              user?.name ||
                              '—'}
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">Thời gian canh tác</Text>
                          <div className="mt-1 font-semibold">
                            <CalendarOutlined className="mr-1 text-green-600" />
                            {plan.startDate
                              ? formatDate(plan.startDate)
                              : '—'}{' '}
                            –{' '}
                            {plan.expectedEndDate
                              ? formatDate(plan.expectedEndDate)
                              : '—'}
                          </div>
                        </div>
                        <div>
                          <Text type="secondary">Quy trình</Text>
                          <div className="mt-1 font-semibold">
                            {plan.stageCount || 0} giai đoạn canh tác
                          </div>
                        </div>
                      </div>

                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => openDetail(plan.id)}
                        className="w-full h-10 mt-5 font-semibold bg-green-600 rounded-lg"
                      >
                        Xem nhật ký
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
            <div className="flex justify-end mt-5">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={visiblePlans.length}
                showSizeChanger
                pageSizeOptions={PAGE_SIZE}
                onChange={(nextPage, nextPageSize) => {
                  setPage(nextPage)
                  setPageSize(nextPageSize)
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có nhật ký phù hợp với bộ lọc."
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default FarmSupervisorLogbooks
