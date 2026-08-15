import {
  BugOutlined,
  CheckCircleOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import { PesticideIcon } from 'src/assets/icon/menu/MenuIcons'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import InventoryImportModal from 'src/components/Inventory/InventoryImportModal'
import { createSTTColumn, createStatusColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'

import PesticideService from 'src/services/PesticideService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'
import { useListManagement } from 'src/hooks/useListManagement'

const ViewPesticides = () => {
  const navigate = useNavigate()
  const { getCombo, getDescription } = useSystemKey()

  // ── Use List Management Hook ────────────────────────────────────────────────
  const {
    searchInput, setSearchInput, search, handleSearch, handleClearSearch,
    page, setPage, pageSize, setPageSize,
    filters, updateFilter,
    listData, setListData, totalRecords, setTotalRecords,
    loading, setLoading
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { category: 'all', status: 'ACTIVE' }
  })

  const statusFilter = filters.status

  // ── State: modals ───────────────────────────────────────────────────────────
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusModal, setStatusModal] = useState({ open: false, item: null })
  const [importModal, setImportModal] = useState({ open: false, item: null })
  const [inUseAlert, setInUseAlert] = useState(false)

  // ── Status Options ──────────────────────────────────────────────────────────
  const statusOptions = getCombo(SYSTEM_KEY.STATUS)
  const selectStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...statusOptions.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

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
  }, [page, pageSize, search, statusFilter, setLoading, setListData, setTotalRecords])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ────────────────────────────────────────────────────────────────

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
      const toggle = item.isActive
        ? PesticideService.deactivatePesticide
        : PesticideService.reactivatePesticide
      await toggle(item.id)
      setStatusModal({ open: false, item: null })
      getList()
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await PesticideService.deletePesticide(id)
      getList()
    } catch {
      // error handled by interceptor
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    createSTTColumn(page, pageSize),
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
      render: (v, record) => {
        const qty = Number(v || 0);
        const minStock = Number(record.minInventory ?? record.minimumStock ?? 0);
        let colorClass = 'text-blue-600';
        if (minStock > 0) {
          if (qty <= minStock) colorClass = 'text-red-500';
          else if (qty <= minStock * 1.5) colorClass = 'text-orange-500';
        } else if (qty === 0) {
          colorClass = 'text-red-500';
        }
        return (
          <span className={`text-sm font-semibold ${colorClass}`}>
            {v != null
              ? `${qty.toLocaleString('vi-VN')} ${record.inventoryUnit || record.unit || ''}`
              : '0'}
          </span>
        );
      },
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
    createStatusColumn({
      getLabel: (isActive) => {
        const sysVal = isActive ? 'ACTIVE' : 'INACTIVE'
        return getDescription(SYSTEM_KEY.STATUS, sysVal) || (isActive ? 'Hoạt động' : 'Vô hiệu')
      }
    }),
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
            {!active && <Popconfirm
              title="Xóa nông dược"
              description="Bạn có chắc chắn muốn xóa nông dược này không?"
              onConfirm={(e) => {
                e.stopPropagation()
                return handleDelete(record.id)
              }}
              onCancel={(e) => e.stopPropagation()}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Tooltip title={locked ? 'Nông dược đang được sử dụng, không thể xóa' : 'Xóa'}>
                <Button
                  type="text"
                  disabled={locked}
                  icon={<DeleteOutlined className={`text-lg ${locked ? 'text-gray-300' : 'text-red-500'}`} />}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg ${locked ? 'opacity-40' : 'hover:bg-red-50'}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>}
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
            <PesticideIcon style={{ fontSize: '24px', color: '#15803d' }} />
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
            placeholder="Tìm theo mã, tên thuốc bảo vệ thực vật..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            value={statusFilter}
            onChange={(val) => updateFilter('status', val)}
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
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
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
