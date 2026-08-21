import { ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, DatePicker, Input, Select, Tag } from "antd"
import { useCallback, useEffect, useState } from "react"

import { ImportHistoryIcon } from "src/assets/icon/menu/MenuIcons"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import { formatAreaUnit } from "src/constants/measurementUnits"
import { UI } from "src/constants/uiConfig"
import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { useListManagement } from "src/hooks/useListManagement"
import MaterialUsageService from "src/services/MaterialUsageService"
import { formatDateTime } from "src/utils/dateFormatters"
import { createPaginationConfig } from "src/utils/tableUtils"

const { RangePicker } = DatePicker
const MATERIAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại vật tư" },
  { value: "FERTILIZER", label: "Phân bón" },
  { value: "PESTICIDE", label: "Nông dược" },
]
const TIME_SORT_OPTIONS = [
  { value: "descend", label: "Mới nhất trước" },
  { value: "ascend", label: "Cũ nhất trước" },
]
const unwrap = response => response?.data?.data ?? response?.data ?? {}
const typeLabel = value => value === "FERTILIZER" ? "Phân bón" : value === "PESTICIDE" ? "Nông dược" : "—"
const getLogbookName = row => row.logbookName || row.cultivationLogbookName || row.logbook?.name || "—"
const getUsedAtTimestamp = value => {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const MaterialUsageHistory = () => {
  const { searchInput, setSearchInput, search, handleSearch, handleClearSearch, page, setPage, pageSize, setPageSize, filters, updateFilter, listData: rows, setListData: setRows, totalRecords: total, setTotalRecords: setTotal, loading, setLoading } = useListManagement({ initialPageSize: DEFAULT_PAGE_SIZE, initialFilters: { materialType: "all", dateRange: [] } })
  const { materialType, dateRange } = filters
  const [timeSortOrder, setTimeSortOrder] = useState("descend")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [from, to] = dateRange || []
      const result = unwrap(await MaterialUsageService.getHistory({ PageIndex: page, PageSize: pageSize, MaterialType: materialType === "all" ? undefined : materialType, SearchKeyword: search || undefined, FromDate: from?.format("YYYY-MM-DD"), ToDate: to?.format("YYYY-MM-DD"), SortDescending: timeSortOrder === "descend" }))
      const items = Array.isArray(result) ? result : result.items || []
      const sortMultiplier = timeSortOrder === "descend" ? -1 : 1
      setRows([...items].sort((a, b) => sortMultiplier * (getUsedAtTimestamp(a.usedAt) - getUsedAtTimestamp(b.usedAt))))
      setTotal(Array.isArray(result) ? items.length : (result.totalItems ?? result.totalCount ?? items.length))
    } catch { setRows([]) }
    finally { setLoading(false) }
  }, [dateRange, materialType, page, pageSize, search, setLoading, setRows, setTotal, timeSortOrder])

  useEffect(() => { load() }, [load])

  const columns = [
    { title: "Thời gian", dataIndex: "usedAt", key: "usedAt", width: 145, render: formatDateTime },
    { title: "Vật tư", dataIndex: "materialName", key: "material", width: 155, ellipsis: true, render: value => value || "—" },
    { title: "Loại vật tư", dataIndex: "materialType", key: "materialType", width: 105, render: value => <Tag className="m-0 whitespace-nowrap">{typeLabel(value)}</Tag> },
    { title: "Số lượng", key: "quantity", width: 95, align: "right", render: (_, row) => `${row.quantity ?? "—"} ${row.unit || ""}` },
    { title: "Diện tích", key: "area", width: 90, align: "right", render: (_, row) => row.appliedArea != null ? `${row.appliedArea} ${formatAreaUnit(row.areaUnit || "m²")}` : "—" },
    { title: "Công việc", dataIndex: "taskName", key: "taskName", width: 145, ellipsis: true, render: value => value || "—" },
    { title: "Nhật ký canh tác", key: "logbook", width: 190, ellipsis: true, render: (_, row) => getLogbookName(row) },
    { title: "Người ghi nhận", dataIndex: "recordedByName", key: "recordedByName", width: 140, ellipsis: true, render: value => value || "—" },
  ]

  return <div className={UI.page.wrapper}>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <TitleCustom className="!mb-0 flex items-center gap-2" role="heading" aria-level={1}>
        <ImportHistoryIcon aria-hidden="true" style={{ fontSize: "24px", color: "#15803d" }} />
        <span>Lịch sử sử dụng vật tư</span>
      </TitleCustom>
    </div>
    <div className="admin-filter-card rounded-lg shadow-sm">
      <div className="admin-toolbar flex flex-col gap-3 xl:flex-row xl:items-center xl:flex-wrap">
        <Input value={searchInput} onChange={event => setSearchInput(event.target.value)} onPressEnter={handleSearch} onClear={handleClearSearch} placeholder="Tìm vật tư, công việc hoặc nhật ký" aria-label="Tìm vật tư, công việc hoặc nhật ký" prefix={<SearchOutlined className="text-gray-300" />} className="w-full h-10 rounded-xl xl:w-64" allowClear autoComplete="off" />
        <Select value={timeSortOrder} onChange={value => { setTimeSortOrder(value); setPage(1) }} options={TIME_SORT_OPTIONS} aria-label="Sắp xếp thời gian sử dụng" className="w-full h-10 rounded-xl xl:w-48" />
        <Select value={materialType} onChange={value => updateFilter("materialType", value)} options={MATERIAL_TYPE_OPTIONS} aria-label="Lọc theo loại vật tư" className="w-full h-10 rounded-xl xl:w-52" />
        <RangePicker value={dateRange} onChange={dates => updateFilter("dateRange", dates || [])} format="DD/MM/YYYY" placeholder={["Từ ngày", "Đến ngày"]} aria-label="Lọc theo khoảng ngày sử dụng" className="w-full h-10 rounded-xl xl:w-72" />
        <div className="flex gap-2 xl:ml-auto"><Button onClick={handleSearch} icon={<SearchOutlined />} className="h-10 px-4 font-semibold rounded-xl">Tìm kiếm</Button><Button aria-label="Tải lại lịch sử sử dụng vật tư" icon={<ReloadOutlined />} onClick={load} loading={loading} className="h-10 px-3 rounded-xl" /></div>
      </div>
    </div>
    <CustomTable rowKey="id" tableLayout="fixed" columns={columns} dataSource={rows} loading={loading} textEmpty="Chưa có lịch sử sử dụng vật tư." pagination={createPaginationConfig(page, pageSize, total, (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) })} />
  </div>
}

export default MaterialUsageHistory
