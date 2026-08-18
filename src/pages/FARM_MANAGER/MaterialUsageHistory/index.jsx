import { ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Card, DatePicker, Input, message, Select, Space, Table, Tag } from "antd"
import { useCallback, useEffect, useState } from "react"
import TitleCustom from "src/components/TitleCustom"
import MaterialUsageService from "src/services/MaterialUsageService"
import { formatAreaUnit } from "src/constants/measurementUnits"

const { RangePicker } = DatePicker
const unwrap = response => response?.data?.data ?? response?.data ?? {}
const formatDateTime = value => value ? new Date(value).toLocaleString("vi-VN") : "—"
const typeLabel = value => value === "FERTILIZER" ? "Phân bón" : "Nông dược"

export default function MaterialUsageHistory() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ pageIndex: 1, pageSize: 10, materialType: undefined, searchKeyword: "", dates: [] })
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [from, to] = filters.dates || []
      const result = unwrap(await MaterialUsageService.getHistory({
        PageIndex: filters.pageIndex, PageSize: filters.pageSize,
        MaterialType: filters.materialType, SearchKeyword: filters.searchKeyword || undefined,
        FromDate: from?.startOf("day")?.toISOString(), ToDate: to?.endOf("day")?.toISOString(),
      }))
      setRows(result.items || [])
      setTotal(result.totalItems || 0)
    } catch { message.error("Không thể tải lịch sử sử dụng vật tư.") }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { load() }, [load])

  const columns = [
    { title: "Thời gian", dataIndex: "usedAt", key: "usedAt", render: formatDateTime },
    { title: "Vật tư", key: "material", render: (_, row) => <div><div className="font-medium">{row.materialName || "—"}</div><Tag>{typeLabel(row.materialType)}</Tag></div> },
    { title: "Số lượng", key: "quantity", align: "right", render: (_, row) => `${row.quantity} ${row.unit || ""}` },
    { title: "Diện tích", key: "area", align: "right", render: (_, row) => `${row.appliedArea} ${formatAreaUnit(row.areaUnit || "m²")}` },
    { title: "Công việc", dataIndex: "taskName", key: "taskName", render: value => value || "—" },
    { title: "Nhật ký", key: "dailyLog", render: (_, row) => row.dailyLogDate ? `Nhật ký ${row.dailyLogDate}` : "—" },
    { title: "Người ghi nhận", dataIndex: "recordedByName", key: "recordedByName", render: value => value || "—" },
  ]

  return <div className="space-y-4">
    <TitleCustom title="Lịch sử sử dụng vật tư" />
    <Card>
      <Space wrap className="mb-4">
        <RangePicker value={filters.dates} onChange={dates => setFilters(x => ({ ...x, dates, pageIndex: 1 }))} format="DD/MM/YYYY" />
        <Select allowClear placeholder="Loại vật tư" style={{ width: 150 }} value={filters.materialType} onChange={materialType => setFilters(x => ({ ...x, materialType, pageIndex: 1 }))} options={[{ value: "FERTILIZER", label: "Phân bón" }, { value: "PESTICIDE", label: "Nông dược" }]} />
        <Input allowClear prefix={<SearchOutlined />} placeholder="Tìm vật tư/công việc" style={{ width: 240 }} value={filters.searchKeyword} onChange={e => setFilters(x => ({ ...x, searchKeyword: e.target.value, pageIndex: 1 }))} onPressEnter={load} />
        <Button icon={<ReloadOutlined />} onClick={load}>Tải lại</Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={rows} loading={loading} locale={{ emptyText: "Chưa có lịch sử sử dụng vật tư." }} pagination={{ current: filters.pageIndex, pageSize: filters.pageSize, total, showSizeChanger: true, onChange: (pageIndex, pageSize) => setFilters(x => ({ ...x, pageIndex, pageSize })) }} />
    </Card>
  </div>
}
