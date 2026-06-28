/**
 * Tasks — Quản lý công việc (Farm Manager)
 * Route: /farm-manager/tasks  (ROUTER.FM_TASKS)
 *
 * NOTE: Sử dụng MOCK TaskService — tích hợp API thực sau khi Swagger được sửa.
 *
 * Architecture mirrors /farm-manager/users:
 *   - TitleCustom header + action button
 *   - Card toolbar (search + filters + reload)
 *   - CustomTable with pagination
 *   - Modal-based Create / Update flows (NO Detail Modal per spec)
 *
 * Business Rules:
 *   BR_TSK_02: Items with isInActiveUse === true
 *              → disable "Sửa" button AND disable Switch
 *
 * Notification Messages:
 *   MSG-TSK-01: "Thêm mới công việc thành công."
 *   MSG-TSK-02: "Bạn có chắc chắn muốn thay đổi trạng thái của công việc này?"
 *   MSG-TSK-03: "Cập nhật trạng thái công việc thành công."
 *   MSG-TSK-04: "Không có dữ liệu công việc."
 *   MSG-TSK-08: "Công việc đang được sử dụng trong kế hoạch sản xuất, không thể chỉnh sửa hoặc vô hiệu hóa."
 */
import {
  CheckCircleOutlined,
  CheckSquareOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Input, message, Select, Switch, Tag, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'

import TaskService from 'src/services/StandardTaskService'
import { invalidCharsRegex } from 'src/utils/helpers'

// ── Filter options ────────────────────────────────────────────────────────────
const TASK_TYPE_FILTER = [
  { value: 'all', label: 'Tất cả loại công việc' },
  { value: 'CULTIVATION', label: 'Canh tác' },
  { value: 'IRRIGATION', label: 'Tưới tiêu' },
  { value: 'FERTILIZATION', label: 'Bón phân' },
  { value: 'PEST_CONTROL', label: 'Phòng trừ sâu bệnh' },
  { value: 'HARVESTING', label: 'Thu hoạch' },
  { value: 'PROCESSING', label: 'Chế biến' },
  { value: 'INSPECTION', label: 'Kiểm tra, giám sát' },
  { value: 'MAINTENANCE', label: 'Bảo trì thiết bị' },
  { value: 'OTHER', label: 'Khác' },
]

const STATUS_FILTER = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
]



const TASK_TYPE_LABEL = {
  CULTIVATION: 'Canh tác',
  IRRIGATION: 'Tưới tiêu',
  FERTILIZATION: 'Bón phân',
  PEST_CONTROL: 'Phòng trừ sâu bệnh',
  HARVESTING: 'Thu hoạch',
  PROCESSING: 'Chế biến',
  INSPECTION: 'Kiểm tra',
  MAINTENANCE: 'Bảo trì',
  OTHER: 'Khác',
}

// ── Main Component ────────────────────────────────────────────────────────────
const TasksManagement = () => {
  const navigate = useNavigate()

  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [taskTypeFilter, setTaskTypeFilter] = useState('all')
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

  // ── Fetch list (mock) ───────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        TaskType: taskTypeFilter === 'all' ? undefined : taskTypeFilter,
        Status:
          statusFilter === 'all'
            ? undefined
            : statusFilter === 'active'
              ? true
              : false,
      }
      const res = await TaskService.getAll(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, taskTypeFilter, statusFilter])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ─────────────────────────────────────────────────────────────────
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

  const handleOpenEdit = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    navigate(ROUTER.FM_TASK_EDIT.replace(':id', record.id))
  }

  // BR_TSK_02 check before opening status confirm
  const handleSwitchClick = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    setStatusModal({ open: true, item: record })
  }

  // Thực hiện toggle status (mock)
  const handleStatusChange = async () => {
    if (!statusModal.item) return
    const { item } = statusModal
    try {
      setStatusLoading(true)
      const res = await TaskService.toggleStatus(item.id, {
        isActive: !item.isActive,
      })
      if (res?.success === false) return
      message.success('Cập nhật trạng thái công việc thành công.')
      setStatusModal({ open: false, item: null })
      getList()
    } finally {
      setStatusLoading(false)
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
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
      title: 'Tên công việc',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Đối tượng',
      dataIndex: 'typeOfObject',
      key: 'typeOfObject',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const locked = record.isInActiveUse
        const active = record.isActive !== false
        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip
              title={
                locked
                  ? 'Công việc đang được sử dụng, không thể chỉnh sửa'
                  : 'Chỉnh sửa'
              }
            >
              <Button
                type="text"
                icon={
                  <EditOutlined
                    className={`text-lg ${locked ? 'text-gray-300' : 'text-blue-500'}`}
                  />
                }
                disabled={locked}
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${locked ? 'opacity-40' : 'hover:bg-blue-50'
                  }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit(record)
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                locked
                  ? 'Công việc đang được sử dụng'
                  : active
                    ? 'Vô hiệu hóa'
                    : 'Kích hoạt'
              }
            >
              <Button
                type="text"
                icon={
                  active ? (
                    <StopOutlined className={`text-lg ${locked ? 'text-gray-300' : 'text-red-500'}`} />
                  ) : (
                    <CheckCircleOutlined className={`text-lg ${locked ? 'text-gray-300' : 'text-green-500'}`} />
                  )
                }
                disabled={locked}
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${locked ? 'opacity-40' : active ? 'hover:bg-red-50' : 'hover:bg-green-50'
                  }`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSwitchClick(record)
                }}
              />
            </Tooltip>
          </div>
        )
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CheckCircleOutlined className="text-lg" />
            Quản lý công việc
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_TASK_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
        >
          Thêm mới
        </Button>
      </div>

      {/* MSG-TSK-08 alert */}
      {inUseAlert && (
        <Alert
          message="Công việc đang được sử dụng trong kế hoạch sản xuất, không thể chỉnh sửa hoặc vô hiệu hóa."
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
            placeholder="Tìm theo mã, tên công việc..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={taskTypeFilter}
            onChange={(val) => {
              setTaskTypeFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[185px]"
            options={TASK_TYPE_FILTER}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
            className="h-10 rounded-xl min-w-[160px]"
            options={STATUS_FILTER}
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
            onClick: () => navigate(ROUTER.FM_TASK_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Không có dữ liệu công việc.' }}
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
          rowClassName="hover:bg-blue-50/30 transition-colors"
        />
      </Card>

      {/* ── Modals ── */}

      {/* Status confirm — MSG-TSK-02 */}
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
            Bạn có chắc chắn muốn thay đổi trạng thái của công việc này?
          </p>
          {statusModal.item && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              <span className="font-mono text-blue-700">
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

export default TasksManagement