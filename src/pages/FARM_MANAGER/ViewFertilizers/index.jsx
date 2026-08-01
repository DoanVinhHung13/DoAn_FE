/**
 * ViewFertilizers — Quản lý phân bón (Farm Manager)
 * Route: /farm-manager/fertilizers  (ROUTER.FM_FERTILIZERS)
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
  CheckCircleOutlined,
  EditOutlined,
  ExperimentOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Tag,
  Tooltip,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'

import CustomModal from 'src/components/Modal/CustomModal'
import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { createSTTColumn, createStatusColumn } from 'src/components/Table/columns.jsx'
import { createPaginationConfig } from 'src/utils/tableUtils'
import { FertilizerIcon } from 'src/assets/icon/menu/MenuIcons'
import InventoryImportModal from 'src/components/Inventory/InventoryImportModal'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'

import FertilizerService from 'src/services/FertilizerService'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'
import { useListManagement } from 'src/hooks/useListManagement'

// ── Main Component ────────────────────────────────────────────────────────────
const ViewFertilizers = () => {
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
    initialFilters: { category: 'all', status: 'all' }
  })

  const categoryFilter = filters.category
  const statusFilter = filters.status

  // ── State: modals ───────────────────────────────────────────────────────────
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusModal, setStatusModal] = useState({ open: false, item: null })
  const [importModal, setImportModal] = useState({ open: false, item: null })
  const [inUseAlert, setInUseAlert] = useState(false)

  // ── Options ─────────────────────────────────────────────────────────────────
  const statusOptions = getCombo(SYSTEM_KEY.STATUS)
  const selectStatusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    ...statusOptions.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

  const fertilizerTypeOptions = getCombo(SYSTEM_KEY.FERTILIZER_TYPE)
  const selectCategoryOptions = [
    { value: 'all', label: 'Tất cả loại' },
    ...fertilizerTypeOptions.map(opt => ({
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
        Type: categoryFilter === 'all' ? undefined : categoryFilter,
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await FertilizerService.getFertilizers(params)
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, categoryFilter, statusFilter, setLoading, setListData, setTotalRecords])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Kiểm tra BR_FER_02 trước khi mở modal Sửa
  const handleOpenEdit = (record) => {
    if (record.isInActiveUse) {
      setInUseAlert(true)
      setTimeout(() => setInUseAlert(false), 5000)
      return
    }
    navigate(ROUTER.FM_FERTILIZER_EDIT.replace(':id', record.id))
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
      await FertilizerService.toggleFertilizerStatus(item.id, {
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
    createSTTColumn(page, pageSize),
    {
      title: 'Tên phân bón',
      dataIndex: 'name',
      key: 'name',
      render: (v) => (
        <span className="">{v || '—'}</span>
      ),
    },

    {
      title: 'Loại Phân Bón',
      dataIndex: 'type',
      key: 'type',
      width: 170,
      render: (v, record) => {
        const typeVal = v || record.category
        return typeVal ? (
          <Tag>
            {typeVal}
          </Tag>
        ) : (
          <span className="text-gray-300">—</span>
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
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      width: 165,
      align: 'right',
      render: (v, record) => (
        <span className="text-sm font-semibold text-gray-700">
          {v != null
            ? `${Number(v).toLocaleString('vi-VN')} ${record.unit || ''}`
            : '—'}
        </span>
      ),
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
            <Tooltip
              title={
                locked
                  ? 'Phân bón đang được sử dụng'
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
            <FertilizerIcon style={{ fontSize: '24px', color: '#15803d' }} />
            Quản lý phân bón
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_FERTILIZER_CREATE)}
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
      <div className="admin-filter-card rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            onChange={(val) => updateFilter('category', val)}
            className="h-10 rounded-xl min-w-[160px]"
            options={selectCategoryOptions}
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

      {/* Table */}
      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1120 }}
        onRow={(record) => ({
          onClick: () => navigate(ROUTER.FM_FERTILIZER_DETAIL.replace(':id', record.id)),
          className: 'cursor-pointer',
        })}
        locale={{ emptyText: 'Không có dữ liệu phân bón.' }}
        pagination={createPaginationConfig(page, pageSize, totalRecords, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
        rowClassName="hover:bg-green-50/30 transition-colors"
      />

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
              {statusModal.item.name}
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
        materialType="FERTILIZER"
      />
    </div>
  )
}

export default ViewFertilizers
