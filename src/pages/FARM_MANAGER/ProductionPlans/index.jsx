/**
 * ProductionPlans — Danh sách Kế hoạch sản xuất (Màn 5)
 * Route: /farm-manager/production-plans  (ROUTER.FM_PRODUCTION_PLANS)
 *
 * Architecture mirrors /farm-manager/view-fertilizers:
 *   - TitleCustom header + action button
 *   - Card toolbar (search + filters + reload)
 *   - CustomTable with pagination
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Input,
  message,
  Select,
  Space,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import { formatDate } from 'src/utils/dateFormatters'
import { invalidCharsRegex } from 'src/utils/helpers'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
]

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-green-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-amber-500',
]
const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0]
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

const getSupervisorName = (plan) => {
  const supervisor =
    plan.assignedFarmSupervisor ||
    plan.farmSupervisor ||
    plan.supervisor

  return (
    plan.assignedFarmSupervisorName ||
    plan.assignedFarmSupervisorFullName ||
    plan.assignedSupervisorName ||
    plan.farmSupervisorName ||
    plan.farmSupervisorFullName ||
    plan.supervisorName ||
    (typeof supervisor === 'string' ? supervisor : null) ||
    supervisor?.fullName ||
    supervisor?.name ||
    null
  )
}

const normalizeProductionPlan = (plan) => ({
  ...plan,
  id: plan.id || plan.productionPlanId,
  planName: plan.planName || plan.name,
  cropName:
    plan.cropName ||
    plan.crop?.name ||
    (typeof plan.crop === 'string' ? plan.crop : null),
  supervisorName: getSupervisorName(plan),
  startDate: plan.startDate || plan.expectedStartDate,
  isActive:
    typeof plan.isActive === 'boolean'
      ? plan.isActive
      : typeof plan.active === 'boolean'
        ? plan.active
        : !plan.isDeleted,
})

// ── Main Component ────────────────────────────────────────────────────────────
const ProductionPlanList = () => {
  const navigate = useNavigate()

  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
      }
      const res = await ProductionPlanService.getAll(params)
      if (res?.success === false) return
      setListData((res?.data?.items || []).map(normalizeProductionPlan))
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  const displayedData =
    statusFilter === 'all'
      ? listData
      : listData.filter((plan) =>
          statusFilter === 'active' ? plan.isActive : !plan.isActive
        )

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 56,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'planName',
      key: 'planName',
      render: (v) => (
        <span className="font-medium text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Cây trồng',
      dataIndex: 'cropName',
      key: 'cropName',
      render: (v) => (
        <span className="text-sm text-gray-700">{v || '—'}</span>
      ),
    },
    {
      title: 'Người giám sát',
      key: 'supervisor',
      render: (_, record) => {
        const supervisorName = record.supervisorName
        if (!supervisorName) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">--</span>
              <span className="text-xs text-gray-400 italic">Chưa chỉ định</span>
            </div>
          )
        }
        const color = getAvatarColor(supervisorName)
        return (
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
              {getInitials(supervisorName)}
            </div>
            <span className="text-sm text-gray-700">{supervisorName}</span>
          </div>
        )
      },
    },
    {
      title: 'Ngày bắt đầu',
      key: 'startDate',
      width: 150,
      render: (_, record) => (
        <span className="text-sm text-gray-700">
          {record.startDate ? formatDate(record.startDate) : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${
              record.isActive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {record.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            <span>{record.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}</span>
          </div>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50"
              onClick={(event) => {
                event.stopPropagation()
                navigate(
                  ROUTER.FM_PRODUCTION_PLAN_EDIT.replace(':id', record.id)
                )
              }}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              size="small"
              danger={record.isActive}
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              className={
                record.isActive
                  ? '!h-8 !w-8 rounded-lg text-red-500 hover:bg-red-50'
                  : '!h-8 !w-8 rounded-lg text-green-600 hover:bg-green-50'
              }
              onClick={(event) => {
                event.stopPropagation()
                message.warning(
                  'API kế hoạch sản xuất chưa hỗ trợ kích hoạt/vô hiệu hóa.'
                )
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CalendarOutlined className="text-green-600" />
            Kế hoạch sản xuất
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_PRODUCTION_PLAN_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo kế hoạch mới
        </Button>
      </div>

      {/* ── Table card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm kiếm kế hoạch sản xuất..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[160px]"
            options={STATUS_OPTIONS}
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <CustomTable
          dataSource={displayedData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_PRODUCTION_PLAN_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Chưa có kế hoạch sản xuất nào.' }}
          pagination={{
            current: page,
            pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} /{' '}
                <strong>{total}</strong>
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
          rowClassName="hover:bg-green-50/30 transition-colors"
        />
      </Card>
    </div>
  )
}

export default ProductionPlanList
