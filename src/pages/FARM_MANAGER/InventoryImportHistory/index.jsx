import {
  CalendarOutlined,
  InboxOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"
import { Button, Card, DatePicker, Input, Select, Tag } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"

import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { createSTTColumn } from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { ImportHistoryIcon } from "src/assets/icon/menu/MenuIcons"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import {
  getQuantityUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import InventoryService from "src/services/InventoryService"
import { normalizeApiError } from "src/services/core/apiError"
import { formatDate as formatConfiguredDate } from "src/utils/dateFormatters"
import { useListManagement } from "src/hooks/useListManagement"
import { UI } from "src/constants/uiConfig"

const { RangePicker } = DatePicker

const MATERIAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại vật tư" },
  { value: "fertilizer", label: "Phân bón" },
  { value: "pesticide", label: "Nông dược" },
]

const EMPTY_VALUE = "—"
const numberFormatter = new Intl.NumberFormat("vi-VN")

const asArray = value => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.transactions)) return value.transactions
  return []
}

const getTotal = (data, rows) =>
  data?.totalItems ??
  data?.totalRecords ??
  data?.totalCount ??
  data?.total ??
  rows.length

const normalize = value =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")

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
  if (
    [
      "pesticide",
      "pesticides",
      "cropprotection",
      "nongduoc",
      "thuocbvtv",
      "thuoc",
    ].includes(normalized)
  ) {
    return { key: "pesticide", label: "Nông dược", color: "orange" }
  }
  if (["fertilizer", "fertilizers", "phanbon", "phan"].includes(normalized)) {
    return { key: "fertilizer", label: "Phân bón", color: "green" }
  }

  const label = raw || record.materialTypeName || record.categoryName
  return label
    ? { key: normalized, label, color: "blue" }
    : { key: "unknown", label: EMPTY_VALUE, color: "default" }
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
  const fallback =
    getMaterialType(record).key === "pesticide"
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
  record.note ||
  record.description ||
  record.remarks ||
  record.reason ||
  EMPTY_VALUE

const InventoryImportHistory = () => {
  // ── Use List Management Hook ────────────────────────────────────────────────
  const {
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    updateFilter,
    listData: rows,
    setListData: setRows,
    totalRecords: total,
    setTotalRecords: setTotal,
    loading,
    setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { typeFilter: "all", dateRange: [] },
  })

  const typeFilter = filters.typeFilter
  const dateRange = filters.dateRange

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        MaterialType: typeFilter === "all" ? undefined : typeFilter,
        FromDate: dateRange[0]?.format("YYYY-MM-DD"),
        ToDate: dateRange[1]?.format("YYYY-MM-DD"),
      }
      const res = await InventoryService.getImportHistory(params)
      const data = res?.data ?? res
      const items = asArray(data)
      setRows(items)
      setTotal(getTotal(data, items))
    } catch (error) {
      const normalizedError = normalizeApiError(error)
      console.error("Inventory import history load error:", {
        kind: normalizedError.kind,
        code: normalizedError.code,
        status: normalizedError.status,
        traceId: normalizedError.traceId,
      })
    } finally {
      setLoading(false)
    }
  }, [
    dateRange,
    page,
    pageSize,
    search,
    typeFilter,
    setLoading,
    setRows,
    setTotal,
  ])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Loại vật tư",
      key: "materialType",
      width: 150,
      render: (_, record) => {
        const type = getMaterialType(record)
        return <Tag color={type.color}>{type.label}</Tag>
      },
    },
    {
      title: "Tên",
      key: "name",
      dataIndex: "name",
      render: (_, record) => (
        <span className="font-semibold text-gray-800 break-words">
          {getMaterialName(record)}
        </span>
      ),
    },
    {
      title: "Số lượng đơn vị",
      key: "quantity",
      width: 160,
      align: "right",
      render: (_, record) => {
        const qty = getQuantity(record)
        const unit = getUnit(record)
        return qty != null ? (
          <span className="font-semibold text-blue-600">
            {numberFormatter.format(Number(qty))} {unit}
          </span>
        ) : (
          EMPTY_VALUE
        )
      },
    },
    {
      title: "Ngày nhập",
      key: "date",
      width: 130,
      render: (_, record) => formatDate(getTransactionDate(record)),
    },
    {
      title: "Ghi chú",
      key: "note",
      width: 300,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const note = getNote(record)
        return note !== EMPTY_VALUE ? (
          <span className="text-gray-600">{note}</span>
        ) : (
          <span className="text-gray-300">{EMPTY_VALUE}</span>
        )
      },
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom
          className="!mb-0 flex items-center gap-2"
          role="heading"
          aria-level={1}
        >
          <ImportHistoryIcon
            aria-hidden="true"
            style={{ fontSize: "24px", color: "#15803d" }}
          />
          Lịch sử nhập vật tư
        </TitleCustom>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarOutlined aria-hidden="true" className="text-green-600" />
          Theo dõi các lần nhập kho
        </div>
      </div>

      <div className="admin-filter-card rounded-lg shadow-sm">
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
              handleClearSearch()
            }}
          />
          <Select
            value={typeFilter}
            onChange={val => updateFilter("typeFilter", val)}
            options={MATERIAL_TYPE_OPTIONS}
            aria-label="Lọc theo loại vật tư"
            className="w-full h-10 rounded-xl xl:w-52"
          />
          <RangePicker
            value={dateRange}
            onChange={dates => updateFilter("dateRange", dates || [])}
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
            aria-label="Lọc theo khoảng ngày nhập"
            className="w-full h-10 rounded-xl xl:w-72"
          />
          <div className="flex gap-2 xl:ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl"
            >
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
      </div>

      <CustomTable
        dataSource={rows}
        columns={columns}
        rowKey={record =>
          record.id ||
          record.transactionId ||
          `${getTransactionDate(record)}-${getMaterialName(record)}`
        }
        loading={loading}
        scroll={{ x: 1050 }}
        locale={{ emptyText: "Không có lịch sử nhập kho." }}
        pagination={createPaginationConfig(page, pageSize, total, (p, ps) => {
          setPage(p)
          setPageSize(ps)
        })}
      />
    </div>
  )
}

export default InventoryImportHistory
