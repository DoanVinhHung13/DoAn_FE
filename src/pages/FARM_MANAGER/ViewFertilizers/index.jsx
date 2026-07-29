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
  Tag,
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

import FertilizerService from 'src/services/FertilizerService'
import { invalidCharsRegex } from 'src/utils/helpers'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

// ── Main Component ────────────────────────────────────────────────────────────
const ViewFertilizers = () => {
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

  const fertilizerTypeOptions = getCombo(SYSTEM_KEY.FERTILIZER_TYPE)
  const selectCategoryOptions = [
    { value: 'all', label: 'Tất cả loại' },
    ...fertilizerTypeOptions.map(opt => ({
      value: opt.codeValue || opt.value,
      label: opt.label || opt.description,
    })),
  ]

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
        Type: categoryFilter === 'all' ? undefined : categoryFilter,
        Status: statusFilter === 'all' ? undefined : statusFilter,
      }
      const res = await FertilizerService.getFertilizers(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, categoryFilter, statusFilter])

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
      const res = await FertilizerService.toggleFertilizerStatus(item.id, {
        isActive: !item.isActive,
      })
      if (res?.success === false) return
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
      width: 140,
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
      width: 140,
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
      width: 140,
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
      width: 150,
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
      width: 140,
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
            options={selectCategoryOptions}
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

        {/* Table */}
        <CustomTable
          dataSource={listData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_FERTILIZER_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
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
