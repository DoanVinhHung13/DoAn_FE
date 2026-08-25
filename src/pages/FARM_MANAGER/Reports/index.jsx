import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Button,
  Card,
  Empty,
  Table,
  Tag,
  Typography,
  message,
} from "antd"
import {
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import { ReportIcon } from "src/assets/icon/menu/MenuIcons"
import { useCropOptions } from "src/hooks/useCropOptions"
import ReportService from "src/services/ReportService"
import authSession from "src/redux/authSession"
import { ROLES } from "src/constants/roles"
import { getLocalNow, formatDateForApi } from "src/utils/dateFormatters"

import {
  REPORT_META,
  REPORT_API_NAMES,
  REPORT_TYPES,
  normalizeHarvestReport,
  normalizeAreaReport,
  normalizeMaterialReport,
} from "./components/reportUtils"
import ReportFilterToolbar from "./components/ReportFilterToolbar"
import ReportSummaryCards from "./components/ReportSummaryCards"
import {
  getHarvestColumns,
  getAreaColumns,
  getMaterialColumns,
} from "./components/ReportTableColumns"

const { Text } = Typography

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

  const columns = useMemo(() => {
    if (activeReport === REPORT_TYPES.HARVEST) return getHarvestColumns()
    if (activeReport === REPORT_TYPES.AREA) return getAreaColumns()
    return getMaterialColumns()
  }, [activeReport])

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

      <ReportFilterToolbar
        activeReport={activeReport}
        setActiveReport={setActiveReport}
        onResetReportError={() => setReportError(null)}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCropId={selectedCropId}
        setSelectedCropId={setSelectedCropId}
        cropOptions={cropOptions}
        isCropsLoading={isCropsLoading}
        onFetchReport={fetchReport}
        reportLoading={reportLoading}
      />

      {reportError && (
        <Alert
          type="error"
          message="Không thể tải dữ liệu báo cáo"
          description={reportError?.message || "Vui lòng thử lại sau."}
        />
      )}

      <ReportSummaryCards
        activeReport={activeReport}
        reportData={reportData}
        currentRows={currentRows}
      />

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
