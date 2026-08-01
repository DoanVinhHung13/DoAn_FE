/**
 * Farm Supervisor: Danh sách Kế hoạch được giao
 * Route: /farm-supervisor/cultivation-logbooks  (ROUTER.FS_CULTIVATION_LOGBOOKS)
 */
import {
  AppstoreOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Skeleton,
  Tag,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard'
import TitleCustom from 'src/components/TitleCustom'
import { PlanLogbookIcon } from 'src/assets/icon/menu/MenuIcons'
import { DEFAULT_PAGE_SIZE, PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'

const FarmSupervisorPlans = () => {
  const navigate = useNavigate()
  const { getLogbookStatus, logbookFilterOptions } = useCultivationStatus()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [plans, setPlans] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [reloadKey, setReloadKey] = useState(0)
  const [totalPlans, setTotalPlans] = useState(0)
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem('fs-plan-view') || 'card'
  )

  useEffect(() => {
    localStorage.setItem('fs-plan-view', viewMode)
  }, [viewMode])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setLoadError(false)
        const res = await CultivationLogbookService.getAll({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: search || undefined,
          Status: statusFilter === 'all' ? undefined : statusFilter,
        }, {
          errorHandling: 'component',
        })
        if (!mounted) return
        // Axios interceptor trả body EAPLS: { success, data: { items } | items[] }
        const data = res?.data
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.Items || []
        setPlans(Array.isArray(items) ? items : [])
        setTotalPlans(Array.isArray(data) ? items.length : (data?.totalItems || data?.TotalItems || 0))
      } catch {
        if (mounted) {
          setLoadError(true)
          setPlans([])
          setTotalPlans(0)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [reloadKey, page, pageSize, search, statusFilter])

  const visiblePlans = plans

  const pagedCards = visiblePlans

  const openDetail = (id) =>
    navigate(ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL.replace(':planId', id))

  const handleSearch = () => { setSearch(searchInput.trim()); setPage(1) }
  const handleClearSearch = () => { setSearchInput(''); setSearch(''); setPage(1) }

  const columns = [
    {
      title: 'STT', key: 'index', width: 55, align: 'center',
      render: (_, __, i) => <span className="text-gray-400">{(page - 1) * pageSize + i + 1}</span>,
    },
    {
      title: 'Tên kế hoạch', dataIndex: 'logbookName', key: 'logbookName',
      render: (value) => <span className="font-medium text-gray-900">{value || '—'}</span>,
    },
    {
      title: 'Cây trồng', dataIndex: 'cropName', key: 'cropName', width: 190,
      render: (value) => <span className="whitespace-nowrap">{value || '—'}</span>,
    },
    {
      title: 'Thời gian', key: 'time', width: 190,
      render: (_, plan) => (
        <span className="whitespace-nowrap text-gray-600">
          {plan.startDate ? formatDate(plan.startDate) : ''} – {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : ''}
        </span>
      ),
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 145,
      render: (value) => {
        const s = getLogbookStatus(value)
        return <Tag color={s.color}>{s.label}</Tag>
      },
    },
    {
      title: '', key: 'action', align: 'center', width: 60,
      render: (_, plan) => (
        <Button type="text" size="small" icon={<EyeOutlined />}
          onClick={(e) => { e.stopPropagation(); openDetail(plan.id) }}
          className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
        />
      ),
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <TitleCustom className="!mb-0 flex items-center gap-2">
        <PlanLogbookIcon style={{ fontSize: '24px', color: '#15803d' }} />
        Kế hoạch canh tác được giao
      </TitleCustom>

      <div className="admin-filter-card rounded-2xl shadow-sm">
        {/* Toolbar */}
        <div className="admin-toolbar flex flex-wrap items-center gap-2  border-b border-gray-100">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={handleSearch}
              onClear={handleClearSearch}
              placeholder="Tìm theo tên kế hoạch, cây trồng, vùng trồng..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="w-full h-10 rounded-xl lg:w-72"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1) }}
              className="h-10 min-w-44 rounded-xl"
              options={logbookFilterOptions}
            />
            <div className="flex gap-2">
              <Button onClick={handleSearch} icon={<SearchOutlined />} className="h-10 px-4 rounded-xl bg-gray-50">
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => setReloadKey((v) => v + 1)} loading={loading} className="h-10 px-3 rounded-xl bg-gray-50" title="Làm mới" />
            </div>
          </div>

          {/* View toggle */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="inline-flex overflow-hidden border border-gray-200 rounded-lg">
              {[
                { mode: 'table', icon: <UnorderedListOutlined />, label: 'Bảng' },
                { mode: 'card', icon: <AppstoreOutlined />, label: 'Thẻ' },
              ].map(({ mode, icon, label }) => (
                <Button key={mode} type={viewMode === mode ? 'primary' : 'text'} icon={icon}
                  onClick={() => { setViewMode(mode); setPage(1) }}
                  className={`h-9 rounded-none border-0 px-4 text-sm font-semibold ${viewMode === mode ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:!bg-green-50 hover:!text-green-700'}`}
                >
                  {label}
                </Button>
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {totalPlans} kế hoạch
            </span>
          </div>
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="p-5 bg-white rounded-2xl"><Skeleton active paragraph={{ rows: 6 }} /></div>
      ) : loadError ? (
        <div className="p-5 bg-white rounded-2xl">
          <Alert
            type="error"
            showIcon
            message="Không thể tải danh sách kế hoạch."
            action={<Button size="small" onClick={() => setReloadKey((v) => v + 1)}>Thử lại</Button>}
            className="rounded-xl"
          />
        </div>
      ) : viewMode === 'table' ? (
        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={visiblePlans}
          scroll={{ x: 950 }}
          onRow={(plan) => ({ onClick: () => openDetail(plan.id), className: 'cursor-pointer' })}
          rowClassName="hover:bg-green-50/30 transition-colors"
          locale={{ emptyText: 'Không có kế hoạch phù hợp.' }}
          pagination={{
            current: page,
            pageSize,
            total: totalPlans,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) },
          }}
        />
      ) : (
        <>
          {visiblePlans.length ? (
            <div className="p-5 bg-white rounded-2xl">
              <div className="grid gap-4 xl:grid-cols-2">
                {pagedCards.map((plan) => {
                  const status = getLogbookStatus(plan.status)
                  return (
                    <Card
                      key={plan.id}
                      bordered={false}
                      className="overflow-hidden transition border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer"
                      bodyStyle={{ padding: 0 }}
                      onClick={() => openDetail(plan.id)}
                    >
                      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Tag color={status.color} className="rounded-full m-0">{status.label}</Tag>
                        </div>
                        <h3 className="m-0 text-base font-bold text-gray-900">
                          {plan.logbookName}
                        </h3>
                        <p className="mt-0.5 mb-0 text-sm text-gray-500">{plan.cropName || 'Chưa có cây trồng'}</p>
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <UserOutlined className="flex-shrink-0 text-green-500" />
                            <span>{plan.supervisorName || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <CalendarOutlined className="flex-shrink-0 text-green-500" />
                            <span>
                              {plan.startDate ? formatDate(plan.startDate) : '—'} – {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : 'Chưa kết thúc'}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="primary" icon={<EyeOutlined />}
                          onClick={() => openDetail(plan.id)}
                          className="w-full h-9 mt-4 font-semibold bg-green-600 rounded-lg border-0"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl">
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có kế hoạch phù hợp." />
            </div>
          )}

          {visiblePlans.length ? (
            <AdminPaginationCard
              pagination={{
                current: page,
                pageSize,
                total: totalPlans,
                showSizeChanger: true,
                pageSizeOptions: PAGE_SIZE,
                onChange: (p, ps) => { setPage(p); setPageSize(ps) },
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}

export default FarmSupervisorPlans
