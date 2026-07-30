import {
  CalendarOutlined,
  InboxOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Card, DatePicker, Input, Select, Tag, message } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'

import CustomTable from 'src/components/Table/CustomTable'
import AdminPaginationCard from 'src/components/Table/AdminPaginationCard'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { getQuantityUnit, MEASUREMENT_UNITS } from 'src/constants/measurementUnits'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import InventoryService from 'src/services/InventoryService'
import { formatDate as formatConfiguredDate } from 'src/utils/dateFormatters'

const { RangePicker } = DatePicker

const MATERIAL_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả loại vật tư' },
  { value: 'fertilizer', label: 'Phân bón' },
  { value: 'pesticide', label: 'Nông dược' },
]

const EMPTY_VALUE = '—'
const numberFormatter = new Intl.NumberFormat('vi-VN')

const asArray = value => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.transactions)) return value.transactions
  return []
}

const getTotal = (data, rows) =>
  data?.totalItems ?? data?.totalRecords ?? data?.totalCount ?? data?.total ?? rows.length

const normalize = value => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '')

const getMaterialType = record => {
  const raw =
    record.materialType ||
    record.materialCategory ||
    record.category ||
    record.itemType ||
    record.productType ||
    record.material?.type ||
    record.material?.category

  const normalized = normalize(raw)
  if (['pesticide', 'pesticides', 'cropprotection', 'nongduoc', 'thuocbvtv', 'thuoc'].includes(normalized)) {
    return { key: 'pesticide', label: 'Nông dược', color: 'orange' }
  }
  if (['fertilizer', 'fertilizers', 'phanbon', 'phan'].includes(normalized)) {
    return { key: 'fertilizer', label: 'Phân bón', color: 'green' }
  }

  const label = raw || record.materialTypeName || record.categoryName
  return label
    ? { key: normalized, label, color: 'blue' }
    : { key: 'unknown', label: EMPTY_VALUE, color: 'default' }
}

const getMaterialName = record =>
  record.materialName ||
  record.name ||
  record.itemName ||
  record.inventoryName ||
  record.fertilizerName ||
  record.pesticideName ||
  record.material?.name ||
  record.inventory?.name ||
  EMPTY_VALUE

const getQuantity = record =>
  record.quantity ??
  record.importQuantity ??
  record.amount ??
  record.stockQuantity ??
  record.changeQuantity

const getUnit = record => {
  const rawUnit =
    record.unit ||
    record.quantityUnit ||
    record.inventoryUnit ||
    record.material?.unit ||
    record.inventory?.unit
  const fallback = getMaterialType(record).key === 'pesticide'
    ? MEASUREMENT_UNITS.LITER
    : MEASUREMENT_UNITS.KILOGRAM
  return getQuantityUnit(rawUnit, fallback)
}

const getTransactionDate = record =>
  record.importDate ||
  record.importedAt ||
  record.transactionDate ||
  record.occurredAt ||
  record.createdAt ||
  record.createdDate ||
  record.date

const formatDate = value => {
  if (!value) return EMPTY_VALUE
  return formatConfiguredDate(value)
}

const getNote = record =>
  record.note || record.description || record.remarks || record.reason || EMPTY_VALUE

const InventoryImportHistory = () => {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateRange, setDateRange] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        MaterialType: typeFilter === 'all' ? undefined : typeFilter,
        FromDate: dateRange[0]?.format('YYYY-MM-DD'),
        ToDate: dateRange[1]?.format('YYYY-MM-DD'),
      }
      const res = await InventoryService.getImportHistory(params)
      if (res?.success === false) return

      const data = res?.data ?? res
      const items = asArray(data)
      setRows(items)
      setTotal(getTotal(data, items))
    } catch (error) {
      console.error(error)
      message.error('Không thể tải lịch sử nhập vật tư.')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [dateRange, page, pageSize, search, typeFilter])

  useEffect(() => {
    getList()
  }, [getList])

  const handleSearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const handleDateChange = values => {
    setDateRange(values || [])
    setPage(1)
  }

  const columns = useMemo(() => [
    {
      title: 'STT',
      key: 'index',
      width: 64,
      align: 'center',
      render: (_, __, index) => (
        <span className="font-medium text-gray-400">{(page - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      title: 'Loại vật tư',
      key: 'materialType',
      width: 150,
      render: (_, record) => {
        const type = getMaterialType(record)
        return <Tag color={type.color}>{type.label}</Tag>
      },
    },
    {
      title: 'Tên',
      key: 'name',
      dataIndex: 'name',
      render: (_, record) => <span className="font-semibold text-gray-800 break-words">{getMaterialName(record)}</span>,
    },
    {
      title: 'Số lượng đơn vị',
      key: 'quantity',
      width: 180,
      align: 'right',
      render: (_, record) => {
        const quantity = getQuantity(record)
        const formattedQuantity = quantity == null ? EMPTY_VALUE : numberFormatter.format(Number(quantity))
        return <span className="font-semibold tabular-nums text-emerald-700">{formattedQuantity} {getUnit(record)}</span>
      },
    },
    {
      title: 'Ngày nhập',
      key: 'date',
      width: 140,
      render: (_, record) => <span className="text-gray-700">{formatDate(getTransactionDate(record))}</span>,
    },
    {
      title: 'Ghi chú',
      key: 'note',
      width: 300,
      render: (_, record) => (
        <span className={`break-words ${getNote(record) === EMPTY_VALUE ? 'text-gray-300' : 'text-gray-600'}`}>
          {getNote(record)}
        </span>
      ),
    },
  ], [page, pageSize])

  return (
    <div className="admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2" role="heading" aria-level={1}>
          <InboxOutlined aria-hidden="true" className="text-green-600" />
          Lịch sử nhập vật tư
        </TitleCustom>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarOutlined aria-hidden="true" className="text-green-600" />
          Theo dõi các lần nhập kho
        </div>
      </div>

      <Card variant="borderless" className="admin-filter-card rounded-lg shadow-sm">
        <div className="admin-toolbar flex flex-col gap-3 xl:flex-row xl:items-center xl:flex-wrap">
          <Input
            value={searchInput}
            onChange={event => setSearchInput(event.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên vật tư…"
            aria-label="Tìm theo tên vật tư"
            autoComplete="off"
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-full h-10 rounded-xl xl:w-64"
            allowClear
            onClear={() => {
              setSearchInput('')
              setSearch('')
              setPage(1)
            }}
          />
          <Select
            value={typeFilter}
            onChange={value => {
              setTypeFilter(value)
              setPage(1)
            }}
            options={MATERIAL_TYPE_OPTIONS}
            aria-label="Lọc theo loại vật tư"
            className="w-full h-10 rounded-xl xl:w-52"
          />
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            aria-label="Lọc theo khoảng ngày nhập"
            className="w-full h-10 rounded-xl xl:w-72"
          />
          <div className="flex gap-2 xl:ml-auto">
            <Button onClick={handleSearch} icon={<SearchOutlined />} className="h-10 px-4 font-semibold rounded-xl">
              Tìm kiếm
            </Button>
            <Button
              aria-label="Tải lại lịch sử nhập vật tư"
              icon={<ReloadOutlined />}
              onClick={getList}
              loading={loading}
              className="h-10 px-3 rounded-xl"
            />
          </div>
        </div>

      </Card>

      <Card
        variant="borderless"
        className="admin-data-card overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <CustomTable
          dataSource={rows}
          columns={columns}
          rowKey={record => record.id || record.transactionId || `${getTransactionDate(record)}-${getMaterialName(record)}`}
          loading={loading}
          scroll={{ x: 1050 }}
          locale={{ emptyText: 'Chưa có lịch sử nhập vật tư.' }}
          pagination={false}
          rowClassName="hover:bg-green-50/30 transition-colors"
        />
      </Card>

      <AdminPaginationCard
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE,
          showTotal: (value, range) => (
            <span className="text-xs text-gray-500">
              {range[0]}–{range[1]} / <strong>{value}</strong>
            </span>
          ),
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          },
        }}
      />
    </div>
  )
}

export default InventoryImportHistory
