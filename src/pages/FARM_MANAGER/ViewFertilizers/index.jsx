/**
 * ViewFertilizers — Quản lý phân bón (Farm Manager)
 * Route: /farm-manager/view-fertilizers  (ROUTER.FM_VIEW_FERTILIZERS)
 *
 * Architecture mirrors /farm-manager/users:
 *   - TitleCustom header + action button
 *   - Card toolbar (search + filters + reload)
 *   - CustomTable with pagination
 *   - Modal-based Create / Update / Detail flows
 *
 * Business Rules:
 *   BR_FER_02: Items with status "In Active Use" (isInActiveUse === true)
 *              → disable "Sửa" button AND disable Switch
 *
 * Notification Messages:
 *   MSG-FER-01: "Thêm mới phân bón thành công."
 *   MSG-FER-02: "Bạn có chắc chắn muốn thay đổi trạng thái của phân bón này?"
 *   MSG-FER-03: "Cập nhật trạng thái phân bón thành công."
 *   MSG-FER-04: "Không có dữ liệu phân bón."
 *   MSG-FER-08: "Phân bón đang được sử dụng trong kế hoạch sản xuất, không thể chỉnh sửa hoặc vô hiệu hóa."
 */
import {
  EditOutlined,
  ExperimentOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Input,
  message,
  Select,
  Switch,
  Tag,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

import FertilizerService from 'src/services/FertilizerService'
import { invalidCharsRegex } from 'src/utils/helpers'

// ── Loại phân bón options cho bộ lọc ───────────────────────────────────────
const CATEGORY_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'Vô cơ', label: 'Vô cơ' },
  { value: 'Hữu cơ', label: 'Hữu cơ' },
  { value: 'Hữu cơ khoáng', label: 'Hữu cơ khoáng' },
  { value: 'Vi sinh', label: 'Vi sinh' },
  { value: 'Phức hợp', label: 'Phức hợp' },
  { value: 'NPK', label: 'Phân NPK' },
  { value: 'Urê', label: 'Phân Urê' },
  { value: 'Khác', label: 'Khác' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
]

// ── Type tag color map ───────────────────────────────────────────────────────
const CATEGORY_COLOR = {
  'Vô cơ': 'orange',
  'Hữu cơ': 'lime',
  'Hữu cơ khoáng': 'green',
  'Vi sinh': 'cyan',
  'Phức hợp': 'purple',
  'NPK': 'green',
  'Urê': 'blue',
  'Khác': 'default',
}

// ── Main Component ────────────────────────────────────────────────────────────
const ViewFertilizers = () => {
  const navigate = useNavigate()

  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  // ── State: modals ───────────────────────────────────────────────────────────
  const [statusModal, setStatusModal] = useState({ open: false, item: null })
  const [inUseAlert, setInUseAlert] = useState(false)

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? true
              : false,
      }
      const res = await FertilizerService.getFertilizers(params)
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

  // Kiểm tra BR_FER_02 trước khi mở modal Sửa
  const handleOpenEdit = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    navigate(ROUTER.FM_VIEW_FERTILIZER_EDIT.replace(':id', record.id))
  }

  // Kiểm tra BR_FER_02 trước khi mở confirm toggle
  const handleSwitchClick = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    setStatusModal({ open: true, item: record })
  }

  // Thực hiện toggle status
  const handleStatusChange = async () => {
    if (!statusModal.item) return
    const { item } = statusModal
    try {
      setStatusLoading(true)
      const res = await FertilizerService.toggleFertilizerStatus(item.id, {
        isActive: !item.isActive,
      })
      if (res?.success === false) return
      message.success('Cập nhật trạng thái phân bón thành công.')
      setStatusModal({ open: false, item: null })
      getList()
    } finally {
      setStatusLoading(false)
    }
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
      title: 'Mã phân bón',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (v) => (
        <span className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg font-mono">
          {v || '—'}
        </span>
      ),
    },
    {
      title: 'Tên phân bón',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Nhà Sản Xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 160,
      render: (v) => (
        <span className="text-sm text-gray-600">{v || '—'}</span>
      ),
    },
    {
      title: 'Loại Phân Bón',
      dataIndex: 'fertilizerType',
      key: 'fertilizerType',
      width: 140,
      render: (v, record) => {
        const typeVal = v || record.category
        return typeVal ? (
          <Tag
            color={CATEGORY_COLOR[typeVal] || 'default'}
            className="font-medium rounded-full"
          >
            {typeVal}
          </Tag>
        ) : (
          <span className="text-gray-300">—</span>
        )
      },
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'unit',
      key: 'unit',
      width: 110,
      align: 'center',
      render: (v) =>
        v ? (
          <Tag color="blue" className="rounded-full font-medium">
            {v}
          </Tag>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      width: 120,
      align: 'right',
      render: (v, record) => (
        <span className="text-sm font-semibold text-gray-700">
          {v != null
            ? `${Number(v).toLocaleString('vi-VN')} ${record.unit || ''}`
            : '—'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      align: 'center',
      render: (isActive, record) => {
        const locked = record.isInActiveUse
        return (
          <Tooltip
            title={
              locked
                ? 'Phân bón đang được sử dụng'
                : isActive
                  ? 'Nhấn để vô hiệu hóa'
                  : 'Nhấn để kích hoạt'
            }
          >
            <Switch
              checked={isActive !== false}
              disabled={locked}
              size="small"
              onClick={() => handleSwitchClick(record)}
              className={isActive !== false ? 'bg-green-500' : ''}
            />
          </Tooltip>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const locked = record.isInActiveUse
        return (
          <div className="flex items-center justify-center gap-1">
            {/* Xem chi tiết */}
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined className="text-lg text-blue-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(ROUTER.FM_VIEW_FERTILIZER_DETAIL.replace(':id', record.id))
                }}
              />
            </Tooltip>

            {/* Sửa — BR_FER_02: disabled nếu isInActiveUse */}
            <Tooltip
              title={
                locked
                  ? 'Phân bón đang được sử dụng, không thể chỉnh sửa'
                  : 'Chỉnh sửa'
              }
            >
              <Button
                type="text"
                icon={
                  <EditOutlined
                    className={`text-lg ${locked ? 'text-gray-300' : 'text-green-500'}`}
                  />
                }
                disabled={locked}
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${locked ? 'opacity-40' : 'hover:bg-green-50'
                  }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit(record)
                }}
              />
            </Tooltip>
          </div>
        )
      },
    },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ExperimentOutlined className="text-green-600" />
            Quản lý phân bón
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_VIEW_FERTILIZER_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Thêm mới
        </Button>
      </div>

      {/* MSG-FER-08 alert */}
      {inUseAlert && (
        <Alert
          message="Phân bón đang được sử dụng trong kế hoạch sản xuất, không thể chỉnh sửa hoặc vô hiệu hóa."
          type="warning"
          showIcon
          closable
          onClose={() => setInUseAlert(false)}
          className="rounded-xl"
        />
      )}

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
            placeholder="Tìm theo mã, tên phân bón..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[160px]"
            options={CATEGORY_FILTER_OPTIONS}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[160px]"
            options={STATUS_FILTER_OPTIONS}
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
          locale={{ emptyText: 'Không có dữ liệu phân bón.' }}
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

      {/* ── Modals ── */}

      {/* Status confirm — MSG-FER-02 */}
      <CustomModal
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, item: null })}
        title={
          <div className="flex items-center">
            <span className="font-bold">Thay đổi trạng thái</span>
          </div>
        }
        footer={null}
        width={420}
      >
        <div className="mt-4 mb-6 ml-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn thay đổi trạng thái của phân bón này?
          </p>
          {statusModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              <span className="font-mono text-emerald-700">
                {statusModal.item.code}
              </span>{' '}
              — {statusModal.item.name}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setStatusModal({ open: false, item: null })}
            className="h-10 px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            loading={statusLoading}
            onClick={handleStatusChange}
            className="h-10 px-6 font-bold bg-orange-500 border-0 shadow-lg rounded-xl shadow-orange-100"
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default ViewFertilizers