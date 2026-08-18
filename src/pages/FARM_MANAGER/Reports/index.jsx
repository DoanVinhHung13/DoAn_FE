import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Col,
  Row,
  Select,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd"
import {
  AreaChartOutlined,
  BarChartOutlined,
  ExperimentOutlined,
  FileExcelOutlined,
  FieldTimeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import { ReportIcon } from "src/assets/icon/menu/MenuIcons"
import { formatAreaUnit } from "src/constants/measurementUnits"
import { useCropOptions } from "src/hooks/useCropOptions"
import ReportService from "src/services/ReportService"
import authSession from "src/redux/authSession"
import { ROLES } from "src/constants/roles"
import { getLocalNow, formatDateForApi } from "src/utils/dateFormatters"

const { RangePicker } = DatePicker
const { Text } = Typography

const REPORT_TYPES = {
  HARVEST: "harvest",
  AREA: "area",
  MATERIAL: "material",
}

const REPORT_API_NAMES = {
  [REPORT_TYPES.HARVEST]: "harvest-yield",
  [REPORT_TYPES.AREA]: "cultivated-area",
  [REPORT_TYPES.MATERIAL]: "material-usage",
}

const REPORT_META = {
  [REPORT_TYPES.HARVEST]: {
    label: "Tổng thu hoạch",
    description: "Theo dõi sản lượng thu hoạch trong khoảng thời gian đã chọn.",
    icon: <BarChartOutlined />,
  },
  [REPORT_TYPES.AREA]: {
    label: "Diện tích canh tác",
    description: "Tra cứu diện tích canh tác theo cây trồng và thời gian.",
    icon: <AreaChartOutlined />,
  },
  [REPORT_TYPES.MATERIAL]: {
    label: "Sử dụng vật tư",
    description: "Tổng hợp khối lượng vật tư đã sử dụng trong kỳ báo cáo.",
    icon: <ExperimentOutlined />,
  },
}

const getPayload = response => {
  const body = response?.data ?? response ?? {}
  return body?.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data)
    ? body.data
    : body
}

const getRows = response => {
  const payload = getPayload(response)
  if (Array.isArray(payload)) return payload

  const rowKeys = ["rows", "Rows", "items", "Items", "results", "Results"]
  for (const key of rowKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return Array.isArray(payload?.data) ? payload.data : []
}

const readField = (source, keys) => {
  const candidates = [
    source,
    source?.summary,
    source?.Summary,
    source?.totals,
    source?.Totals,
  ]
  for (const candidate of candidates) {
    for (const key of keys) {
      if (
        candidate?.[key] !== undefined &&
        candidate?.[key] !== null &&
        candidate?.[key] !== ""
      ) {
        return candidate[key]
      }
    }
  }
  return null
}

const toNumber = value => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (value === null || value === undefined || value === "") return null

  const textValue = String(value).trim().replace(/\s/g, "")
  const normalized = textValue.includes(",")
    ? textValue.replace(/\./g, "").replace(",", ".")
    : textValue
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

const getRowNumber = (row, keys) => toNumber(readField(row, keys))

const sumValues = (rows, keys) =>
  rows.reduce((total, row) => total + (getRowNumber(row, keys) ?? 0), 0)

const formatNumber = value =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 3 })

const formatUnitValue = (value, unit) =>
  `${formatNumber(value)} ${unit || ""}`.trim()

const normalizeHarvestReport = response => {
  const payload = getPayload(response)
  const sourceRows = getRows(response)
  const valueKeys = [
    "QuantityHarvested",
    "quantityHarvested",
    "TotalYield",
    "totalYield",
    "Yield",
    "yield",
    "Quantity",
    "quantity",
    "Production",
    "production",
  ]
  const rows = sourceRows.map((row, index) => ({
    key: `harvest-${index}`,
    cropName:
      readField(row, [
        "CropName",
        "cropName",
        "Crop",
        "crop",
        "Name",
        "name",
      ]) || "Chưa phân loại",
    value: getRowNumber(row, valueKeys) ?? 0,
    unit:
      readField(row, [
        "Unit",
        "unit",
        "YieldUnit",
        "yieldUnit",
        "QuantityUnit",
        "quantityUnit",
      ]) || "kg",
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))
  const unit =
    readField(payload, [
      "Unit",
      "unit",
      "YieldUnit",
      "yieldUnit",
      "QuantityUnit",
      "quantityUnit",
    ]) ||
    rows[0]?.unit ||
    "kg"
  const total = payloadTotal ?? sumValues(rows, ["value"])
  const batchCount =
    toNumber(
      readField(payload, [
        "BatchCount",
        "batchCount",
        "TotalBatches",
        "totalBatches",
      ]),
    ) ?? rows.length

  if (!rows.length && payloadTotal !== null) {
    rows.push({
      key: "harvest-summary",
      cropName: "Tổng cộng",
      value: payloadTotal,
      unit,
    })
  }

  return { rows, total, unit, batchCount }
}

const normalizeAreaReport = (response, selectedCropLabel) => {
  const payload = getPayload(response)
  const sourceRows = getRows(response)
  const valueKeys = [
    "CultivatedArea",
    "cultivatedArea",
    "TotalArea",
    "totalArea",
    "AreaM2",
    "areaM2",
    "Area",
    "area",
  ]
  const rows = sourceRows.map((row, index) => ({
    key: `area-${index}`,
    cropName:
      readField(row, [
        "CropName",
        "cropName",
        "Crop",
        "crop",
        "Name",
        "name",
      ]) ||
      selectedCropLabel ||
      "Chưa phân loại",
    value: getRowNumber(row, valueKeys) ?? 0,
    unit: formatAreaUnit(
      readField(row, ["AreaUnit", "areaUnit", "Unit", "unit"]),
    ),
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))
  const unit = formatAreaUnit(
    readField(payload, ["AreaUnit", "areaUnit", "Unit", "unit"]) ||
      rows[0]?.unit,
  )
  const total = payloadTotal ?? sumValues(rows, ["value"])

  if (!rows.length && payloadTotal !== null) {
    rows.push({
      key: "area-summary",
      cropName: selectedCropLabel || "Tổng cộng",
      value: payloadTotal,
      unit,
    })
  }

  return {
    rows,
    total,
    unit,
    cropName:
      selectedCropLabel ||
      readField(payload, ["CropName", "cropName", "Crop", "crop"]) ||
      "Tất cả cây trồng",
  }
}

const normalizeMaterialReport = response => {
  const payload = getPayload(response)
  const valueKeys = [
    "QuantityUsed",
    "quantityUsed",
    "TotalQuantity",
    "totalQuantity",
    "Quantity",
    "quantity",
  ]
  const rows = getRows(response).map((row, index) => ({
    key: `material-${index}`,
    name:
      readField(row, [
        "Material",
        "material",
        "MaterialName",
        "materialName",
        "Name",
        "name",
      ]) || "Vật tư",
    unit:
      readField(row, ["Unit", "unit", "QuantityUnit", "quantityUnit"]) || "—",
    totalQuantity: getRowNumber(row, valueKeys) ?? 0,
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))

  return {
    rows,
    total: payloadTotal ?? sumValues(rows, ["totalQuantity"]),
  }
}

const ReportStatistics = () => {
  const { cropOptions, isCropsLoading } = useCropOptions()
  const [activeReport, setActiveReport] = useState(REPORT_TYPES.HARVEST)
  const [dateRange, setDateRange] = useState([
    getLocalNow().subtract(30, "day"),
    getLocalNow(),
  ])
  const [selectedCropId, setSelectedCropId] = useState()
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [reportData, setReportData] = useState({ rows: [], total: 0, unit: "" })
  const [exportLoading, setExportLoading] = useState(false)
  const currentUser = authSession.getUser()
  const canExport =
    currentUser?.role === ROLES.FARM_MANAGER ||
    currentUser?.roles?.includes(ROLES.FARM_MANAGER)

  const selectedCropLabel = useMemo(
    () =>
      cropOptions.find(
        option => String(option.value) === String(selectedCropId),
      )?.label,
    [cropOptions, selectedCropId],
  )

  const fetchReport = useCallback(
    async (reportType = activeReport) => {
      if (!dateRange?.[0] || !dateRange?.[1]) {
        message.warning("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.")
        return
      }

      setReportLoading(true)
      setReportError(null)
      setReportData({ rows: [], total: 0, unit: "" })

      const params = {
        DateFrom: formatDateForApi(dateRange[0]),
        DateTo: formatDateForApi(dateRange[1]),
      }

      try {
        let response
        if (reportType === REPORT_TYPES.HARVEST) {
          response = await ReportService.getHarvestYieldReport(params)
          setReportData(normalizeHarvestReport(response))
        } else if (reportType === REPORT_TYPES.AREA) {
          response = await ReportService.getCultivatedAreaReport({
            ...params,
            ...(selectedCropId ? { CropId: selectedCropId } : {}),
          })
          setReportData(normalizeAreaReport(response, selectedCropLabel))
        } else {
          response = await ReportService.getMaterialUsageReport(params)
          setReportData(normalizeMaterialReport(response))
        }
      } catch (error) {
        setReportData({ rows: [], total: 0, unit: "" })
        setReportError(error)
      } finally {
        setReportLoading(false)
      }
    },
    [activeReport, dateRange, selectedCropId, selectedCropLabel],
  )

  const handleExportExcel = useCallback(async () => {
    if (!dateRange?.[0] || !dateRange?.[1]) {
      message.warning("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.")
      return
    }

    setExportLoading(true)
    try {
      const params = {
        reportName: REPORT_API_NAMES[activeReport],
        DateFrom: formatDateForApi(dateRange[0]),
        DateTo: formatDateForApi(dateRange[1]),
        ...(activeReport === REPORT_TYPES.AREA && selectedCropId
          ? { CropId: selectedCropId }
          : {}),
      }
      const response = await ReportService.exportReportExcel(params)
      const blob = response instanceof Blob ? response : response?.data
      if (!(blob instanceof Blob)) throw new Error("Tệp Excel không hợp lệ.")

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replaceAll("-", "")
        .replaceAll(":", "")
      link.download = `eapls-${REPORT_API_NAMES[activeReport]}-${timestamp}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
      message.success("Xuất báo cáo Excel thành công.")
    } catch (error) {
      message.error(error?.message || "Không thể xuất báo cáo Excel.")
    } finally {
      setExportLoading(false)
    }
  }, [activeReport, dateRange, selectedCropId])

  useEffect(() => {
    fetchReport(activeReport)
  }, [activeReport, fetchReport])

  const currentMeta = REPORT_META[activeReport]
  const currentRows = reportData.rows || []

  const harvestColumns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Cây trồng",
      dataIndex: "cropName",
      key: "cropName",
      render: value => <Text strong>{value}</Text>,
    },
    {
      title: "Sản lượng thu hoạch",
      dataIndex: "value",
      key: "value",
      width: 220,
      render: (value, record) => (
        <Text className="font-bold text-green-700">
          {formatUnitValue(value, record.unit)}
        </Text>
      ),
    },
  ]

  const areaColumns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Cây trồng",
      dataIndex: "cropName",
      key: "cropName",
      render: value => <Text strong>{value}</Text>,
    },
    {
      title: "Diện tích canh tác",
      dataIndex: "value",
      key: "value",
      width: 220,
      render: (value, record) => (
        <Text className="font-bold text-emerald-700">
          {formatUnitValue(value, record.unit)}
        </Text>
      ),
    },
  ]

  const materialColumns = [
    {
      title: "STT",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
      render: value => <Text strong>{value}</Text>,
    },
    {
      title: "Tổng sử dụng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 180,
      render: (value, record) => (
        <Text className="font-bold text-green-700">
          {formatUnitValue(value, record.unit)}
        </Text>
      ),
    },
  ]

  const columns =
    activeReport === REPORT_TYPES.HARVEST
      ? harvestColumns
      : activeReport === REPORT_TYPES.AREA
        ? areaColumns
        : materialColumns

  const emptyDescription =
    activeReport === REPORT_TYPES.HARVEST
      ? "Không có dữ liệu thu hoạch trong khoảng thời gian này."
      : activeReport === REPORT_TYPES.AREA
        ? "Không có dữ liệu diện tích canh tác phù hợp với bộ lọc."
        : "Không có dữ liệu vật tư trong khoảng thời gian này."

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <TitleCustom className="!mb-1 flex items-center gap-2">
            <ReportIcon style={{ fontSize: "24px", color: "#15803d" }} />
            Báo cáo thống kê
          </TitleCustom>
          <Text className="text-gray-500">
            Theo dõi nhanh sản lượng, diện tích và vật tư của hoạt động canh
            tác.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchReport()}
            loading={reportLoading}
          >
            Tải lại
          </Button>
          {canExport && (
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              loading={exportLoading}
            >
              Xuất Excel
            </Button>
          )}
        </div>
      </div>

      <Card
        bordered={false}
        className="admin-data-card overflow-hidden rounded-2xl shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          className="px-6"
          activeKey={activeReport}
          onChange={key => {
            setActiveReport(key)
            setReportError(null)
          }}
          items={Object.entries(REPORT_META).map(([key, meta]) => ({
            key,
            label: (
              <span className="flex items-center gap-2">
                {meta.icon}
                {meta.label}
              </span>
            ),
          }))}
        />
      </Card>

      <div className="admin-filter-card rounded-2xl shadow-sm">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FieldTimeOutlined className="text-green-700" />
            <Text strong>{currentMeta.label}</Text>
            <Text type="secondary">— {currentMeta.description}</Text>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {activeReport === REPORT_TYPES.AREA && (
              <div className="w-full lg:w-72">
                <Text className="mb-1 block text-sm font-medium">
                  Cây trồng
                </Text>
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  placeholder="Tất cả cây trồng"
                  loading={isCropsLoading}
                  options={cropOptions}
                  value={selectedCropId}
                  onChange={setSelectedCropId}
                />
              </div>
            )}
            <div className="w-full lg:w-auto">
              <Text className="mb-1 block text-sm font-medium">
                Thời gian từ A - B
              </Text>
              <RangePicker
                value={dateRange}
                format="DD/MM/YYYY"
                onChange={setDateRange}
              />
            </div>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => fetchReport()}
              loading={reportLoading}
            >
              Xem báo cáo
            </Button>
          </div>
        </div>
      </div>

      {reportError && (
        <Alert
          type="error"

          message="Không thể tải dữ liệu báo cáo"
          description={reportError?.message || "Vui lòng thử lại sau."}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card bordered={false} className="rounded-2xl shadow-sm">
            <Statistic
              title={
                activeReport === REPORT_TYPES.HARVEST
                  ? "Tổng sản lượng thu hoạch"
                  : activeReport === REPORT_TYPES.AREA
                    ? "Tổng diện tích canh tác"
                    : "Tổng vật tư đã sử dụng"
              }
              value={formatNumber(reportData.total)}
              suffix={reportData.unit}
              prefix={currentMeta.icon}
              valueStyle={{ color: "#15803d" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="rounded-2xl shadow-sm">
            <Statistic
              title={
                activeReport === REPORT_TYPES.HARVEST
                  ? "Số lô thu hoạch"
                  : activeReport === REPORT_TYPES.AREA
                    ? "Cây trồng đang xem"
                    : "Số loại vật tư"
              }
              value={
                activeReport === REPORT_TYPES.HARVEST
                  ? (reportData.batchCount ?? currentRows.length)
                  : activeReport === REPORT_TYPES.AREA
                    ? reportData.cropName || "Tất cả"
                    : currentRows.length
              }
              suffix={
                activeReport === REPORT_TYPES.HARVEST
                  ? "lô"
                  : activeReport === REPORT_TYPES.MATERIAL
                    ? "loại"
                    : undefined
              }
              valueStyle={{ color: "#166534" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={currentMeta.label}
        bordered={false}
        className="rounded-2xl shadow-sm"
        extra={<Tag color="green">{currentRows.length} dòng dữ liệu</Tag>}
      >
        {currentRows.length === 0 && !reportLoading ? (
          <Empty description={emptyDescription} />
        ) : (
          <Table
            columns={columns}
            dataSource={currentRows}
            loading={reportLoading}
            rowKey="key"
            pagination={false}
            scroll={{ x: 720 }}
          />
        )}
      </Card>
    </div>
  )
}

export default ReportStatistics
