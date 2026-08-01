import {
  BugOutlined,
  CheckCircleOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Input,
  message,
  Select,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import InventoryImportModal from 'src/components/Inventory/InventoryImportModal'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

import PesticideService from 'src/services/PesticideService'
import { invalidCharsRegex } from 'src/utils/helpers'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

const ViewPesticides = () => {
  const navigate = useNavigate()
  const { getCombo, getDescription } = useSystemKey()
  
  const statusOptions = getCombo(SYSTEM_KEY.STATUS)
  const selectStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...statusOptions.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

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
  const [statusLoading, setStatusLoading] = useState(false)

  // ── State: modals ───────────────────────────────────────────────────────────
  const [statusModal, setStatusModal] = useState({ open: false, item: null })
  const [importModal, setImportModal] = useState({ open: false, item: null })
  const [inUseAlert, setInUseAlert] = useState(false)

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
      const res = await PesticideService.getPesticides(params)
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || res?.data?.items?.length || 0)
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

  const handleOpenEdit = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    navigate(ROUTER.FM_PESTICIDE_EDIT.replace(':id', record.id))
  }

  const handleSwitchClick = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    setStatusModal({ open: true, item: record })
  }

  const handleStatusChange = async () => {
    if (!statusModal.item) return
    const { item } = statusModal
    try {
      setStatusLoading(true)
      await PesticideService.togglePesticideStatus(item.id, {
        isActive: !item.isActive,
      })
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
      title: 'Tên nông dược',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (v, record) => {
        const val = v || record.manufacturerName || record.supplier
        return (
          <span className="text-sm text-gray-700">
            {val || '—'}
          </span>
        )
      },
    },
    {
      title: 'Tồn kho thực tế',
      dataIndex: 'inventoryQuantity',
      key: 'inventoryQuantity',
      width: 165,
      align: 'right',
      render: (v, record) => (
        <span className="text-sm font-semibold text-blue-600">
          {v != null
            ? `${Number(v).toLocaleString('vi-VN')} ${record.inventoryUnit || record.unit || ''}`
            : '0'}
        </span>
      ),
    },
    {
      title: 'Tồn kho tối thiểu',
      key: 'minInventory',
      width: 165,
      align: 'right',
      render: (_, record) => {
        const qty = record.minInventory ?? record.minimumStock ?? 0
        const unit = record.unit || ''
        return <span className="text-sm font-semibold text-gray-700">{qty ? `${qty} ${unit}` : '—'}</span>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 165,
      render: (isActive) => {
        const active = isActive !== false
        const sysVal = active ? 'ACTIVE' : 'INACTIVE'
        const label = getDescription(SYSTEM_KEY.STATUS, sysVal) || (active ? 'Hoạt động' : 'Vô hiệu')
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none ${active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}
          >
            {active ? (
              <>
                <CheckCircleOutlined />
                <span>{label}</span>
              </>
            ) : (
              <>
                <StopOutlined />
                <span>{label}</span>
              </>
            )}
          </div>
        )
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const locked = record.isInActiveUse
        const active = record.isActive !== false
        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Nhập vật tư vào kho">
              <Button
                type="text"
                icon={<InboxOutlined className="text-lg text-blue-600" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  setImportModal({ open: true, item: record })
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                locked
                  ? 'Nông dược đang được sử dụng, không thể chỉnh sửa'
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
            <Tooltip
              title={
                locked
                  ? 'Nông dược đang được sử dụng'
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <BugOutlined className="text-green-600" />
            Quản lý nông dược
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_PESTICIDE_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
        >
          Thêm mới
        </Button>
      </div>

      {/* Alert */}
      {inUseAlert && (
        <Alert
          message="Nông dược đang được sử dụng, không thể chỉnh sửa hoặc vô hiệu hóa."
          type="warning"
          showIcon
          closable
          onClose={() => setInUseAlert(false)}
          className="rounded-xl"
        />
      )}

      {/* ── Table card ── */}
      <div className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã, tên nông dược…"
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
            options={selectStatusOptions}
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

      </div>

      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1120 }}
        onRow={(record) => ({
          onClick: () => navigate(ROUTER.FM_PESTICIDE_DETAIL.replace(':id', record.id)),
          className: 'cursor-pointer',
        })}
        locale={{ emptyText: 'Không có dữ liệu nông dược.' }}
        pagination={{
          current: page,
          pageSize,
          total: totalRecords,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
        rowClassName="hover:bg-green-50/30 transition-colors"
      />

      {/* Status confirm */}
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
            Bạn có chắc chắn muốn thay đổi trạng thái của nông dược này?
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

      {/* Inventory Import Modal */}
      <InventoryImportModal
        open={importModal.open}
        item={importModal.item}
        onCancel={() => setImportModal({ open: false, item: null })}
        onSuccess={() => getList()}
        materialType="CROP_PROTECTION"
      />
    </div>
  )
}

export default ViewPesticides
