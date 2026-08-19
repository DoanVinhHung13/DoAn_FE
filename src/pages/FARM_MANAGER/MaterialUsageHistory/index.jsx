import { ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, DatePicker, Input, Select, Tag } from "antd"
import { useCallback, useEffect } from "react"

import { ImportHistoryIcon } from "src/assets/icon/menu/MenuIcons"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import { formatAreaUnit } from "src/constants/measurementUnits"
import { UI } from "src/constants/uiConfig"
import CustomTable from "src/components/Table/CustomTable"
import TitleCustom from "src/components/TitleCustom"
import { useListManagement } from "src/hooks/useListManagement"
import MaterialUsageService from "src/services/MaterialUsageService"
import { createPaginationConfig } from "src/utils/tableUtils"

const { RangePicker } = DatePicker
const MATERIAL_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại vật tư" },
  { value: "FERTILIZER", label: "Phân bón" },
  { value: "PESTICIDE", label: "Nông dược" },
]
const unwrap = response => response?.data?.data ?? response?.data ?? {}
const formatDateTime = value => value ? new Date(value).toLocaleString("vi-VN") : "—"
const typeLabel = value => value === "FERTILIZER" ? "Phân bón" : value === "PESTICIDE" ? "Nông dược" : "—"

const MaterialUsageHistory = () => {
  const { searchInput, setSearchInput, search, handleSearch, handleClearSearch, page, setPage, pageSize, setPageSize, filters, updateFilter, listData: rows, setListData: setRows, totalRecords: total, setTotalRecords: setTotal, loading, setLoading } = useListManagement({ initialPageSize: DEFAULT_PAGE_SIZE, initialFilters: { materialType: "all", dateRange: [] } })
  const { materialType, dateRange } = filters

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [from, to] = dateRange || []
      const result = unwrap(await MaterialUsageService.getHistory({ PageIndex: page, PageSize: pageSize, MaterialType: materialType === "all" ? undefined : materialType, SearchKeyword: search || undefined, FromDate: from?.startOf("day")?.toISOString(), ToDate: to?.endOf("day")?.toISOString() }))
      const items = Array.isArray(result) ? result : result.items || []
      setRows(items)
      setTotal(Array.isArray(result) ? items.length : (result.totalItems ?? result.totalCount ?? items.length))
    } catch { setRows([]) }
    finally { setLoading(false) }
  }, [dateRange, materialType, page, pageSize, search, setLoading, setRows, setTotal])

  useEffect(() => { load() }, [load])

  const columns = [
    { title: "Thời gian", dataIndex: "usedAt", key: "usedAt", render: formatDateTime },
    { title: "Vật tư", key: "material", render: (_, row) => <div><div className="font-medium">{row.materialName || "—"}</div><Tag>{typeLabel(row.materialType)}</Tag></div> },
    { title: "Số lượng", key: "quantity", align: "right", render: (_, row) => `${row.quantity ?? "—"} ${row.unit || ""}` },
    { title: "Diện tích", key: "area", align: "right", render: (_, row) => row.appliedArea != null ? `${row.appliedArea} ${formatAreaUnit(row.areaUnit || "m²")}` : "—" },
    { title: "Công việc", dataIndex: "taskName", key: "taskName", render: value => value || "—" },
    { title: "Nhật ký", key: "dailyLog", render: (_, row) => row.dailyLogDate ? `Nhật ký ${row.dailyLogDate}` : "—" },
    { title: "Người ghi nhận", dataIndex: "recordedByName", key: "recordedByName", render: value => value || "—" },
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
        <RangePicker value={dateRange} onChange={dates => updateFilter("dateRange", dates || [])} format="DD/MM/YYYY" placeholder={["Từ ngày", "Đến ngày"]} aria-label="Lọc theo khoảng ngày sử dụng" className="w-full h-10 rounded-xl xl:w-72" />
        <Select value={materialType} onChange={value => updateFilter("materialType", value)} options={MATERIAL_TYPE_OPTIONS} aria-label="Lọc theo loại vật tư" className="w-full h-10 rounded-xl xl:w-52" />
        <Input value={searchInput} onChange={event => setSearchInput(event.target.value)} onPressEnter={handleSearch} onClear={handleClearSearch} placeholder="Tìm vật tư/công việc" aria-label="Tìm vật tư hoặc công việc" prefix={<SearchOutlined className="text-gray-300" />} className="w-full h-10 rounded-xl xl:w-60" allowClear autoComplete="off" />
        <div className="flex gap-2 xl:ml-auto"><Button onClick={handleSearch} icon={<SearchOutlined />} className="h-10 px-4 font-semibold rounded-xl">Tìm kiếm</Button><Button aria-label="Tải lại lịch sử sử dụng vật tư" icon={<ReloadOutlined />} onClick={load} loading={loading} className="h-10 px-3 rounded-xl" /></div>
      </div>
    </div>
    <CustomTable rowKey="id" columns={columns} dataSource={rows} loading={loading} scroll={{ x: 1050 }} textEmpty="Chưa có lịch sử sử dụng vật tư." pagination={createPaginationConfig(page, pageSize, total, (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) })} />
  </div>
}

export default MaterialUsageHistory
