/**
 * ProductionPlans — Danh sách Nhật ký canh tác (Màn 5)
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
import { invalidCharsRegex } from 'src/utils/helpers'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

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

// ── Main Component ────────────────────────────────────────────────────────────
const ProductionPlanList = () => {
  const navigate = useNavigate()
  const { getCombo, getDescription } = useSystemKey()
  const statusOptions = [{ value: 'all', label: 'Tất cả trạng thái' }, ...getCombo(SYSTEM_KEY.STATUS)]

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
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await ProductionPlanService.getAll(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (v) => (
        <span className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg font-mono">
          {v || '—'}
        </span>
      ),
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="">{v || '—'}</span>
      ),
    },
    {
      title: 'Cây trồng',
      dataIndex: 'crop',
      key: 'crop',
      render: (v) => (
        <span className="text-sm text-gray-700">{v || '—'}</span>
      ),
    },
    {
      title: 'Người giám sát',
      key: 'supervisor',
      render: (_, record) => {
        const sup = record.supervisor
        if (!sup || !sup.name) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">--</span>
              <span className="text-xs text-gray-400 italic">Chưa chỉ định</span>
            </div>
          )
        }
        const color = sup.avatarColor || getAvatarColor(sup.name)
        return (
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
              {getInitials(sup.name)}
            </div>
            <span className="text-sm text-gray-700">{sup.name}</span>
          </div>
        )
      },
    },
    {
      title: 'Ngày bắt đầu',
      key: 'startDate',
      width: 150,
      render: (_, record) => {
        if (record.isPlanned) {
          return (
            <span className="text-sm text-gray-400 italic">
              Dự kiến {record.startDate || '—'}
            </span>
          )
        }
        return <span className="text-sm text-gray-700">{record.startDate || '—'}</span>
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const sysVal = record.status
        const isActive = sysVal === true || String(sysVal || '').toLowerCase() === 'active'
        const label = getDescription(SYSTEM_KEY.STATUS, sysVal) || (isActive ? 'Hoạt động' : 'Vô hiệu')

        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${
              isActive
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
            <span>{label}</span>
          </div>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: () => <span className="text-gray-300">⋯</span>,
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
            Nhật ký canh tác
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_PRODUCTION_PLAN_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Tạo nhật ký mới
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
            placeholder="Tìm kiếm nhật ký canh tác, mã ID..."
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
            options={statusOptions}
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
          dataSource={listData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_PRODUCTION_PLAN_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Chưa có nhật ký canh tác nào.' }}
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