import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Row,
  Col,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  BarChartOutlined,
  ExperimentOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import CultivationLogService from 'src/services/CultivationLogService'
import LandPlotService from 'src/services/LandPlotService'
import { normalizeLandPlotResponse } from 'src/pages/FARM_MANAGER/Lands/landPlotUtils'

const { RangePicker } = DatePicker
const { Text } = Typography

const unwrapItems = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.logs)) return data.logs
  if (Array.isArray(payload?.items)) return payload.items

  return []
}

const getLogDate = (log) =>
  log?.logDate ||
  log?.date ||
  log?.workDate ||
  log?.performedAt ||
  log?.createdAt ||
  log?.updatedAt

const getMaterialName = (item, fallback) =>
  item?.name ||
  item?.materialName ||
  item?.fertilizerName ||
  item?.pesticideName ||
  item?.productName ||
  fallback

const getMaterialQuantity = (item) => {
  const value =
    item?.quantity ??
    item?.totalQuantity ??
    item?.amount ??
    item?.usedQuantity ??
    item?.usageAmount ??
    0

  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const getMaterialUnit = (item, fallback) =>
  item?.quantityUnit ||
  item?.unit ||
  item?.usageUnit ||
  item?.unitName ||
  fallback

const filterLogsByDate = (logs, dateRange) => {
  if (!dateRange?.[0] || !dateRange?.[1]) return logs

  const start = dateRange[0].startOf('day')
  const end = dateRange[1].endOf('day')

  return logs.filter((log) => {
    const value = getLogDate(log)
    if (!value) return false

    const date = dayjs(value)
    return date.isValid() && !date.isBefore(start) && !date.isAfter(end)
  })
}

const aggregateMaterials = (logs, materialKey, fallbackName, fallbackUnit) => {
  const map = new Map()

  logs.forEach((log) => {
    const logDate = getLogDate(log)
    const materials = Array.isArray(log?.[materialKey]) ? log[materialKey] : []

    materials.forEach((item) => {
      const name = getMaterialName(item, fallbackName)
      const unit = getMaterialUnit(item, fallbackUnit)
      const id = item?.materialId || item?.fertilizerId || item?.pesticideId || item?.id || name
      const key = `${id}|${name}|${unit}`

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          unit,
          totalQuantity: 0,
          usageCount: 0,
          dates: new Set(),
        })
      }

      const row = map.get(key)
      row.totalQuantity += getMaterialQuantity(item)
      row.usageCount += 1
      if (logDate) row.dates.add(dayjs(logDate).format('YYYY-MM-DD'))
    })
  })

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      activeDays: row.dates.size,
      totalQuantity: Number(row.totalQuantity.toFixed(3)),
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
}

const formatQuantity = (value) =>
  Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 3,
  })

const ReportStatistics = () => {
  const [landPlots, setLandPlots] = useState([])
  const [selectedLandPlotId, setSelectedLandPlotId] = useState()
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()])
  const [landLoading, setLandLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [logs, setLogs] = useState([])

  const fetchLandPlots = useCallback(async () => {
    setLandLoading(true)
    try {
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 200,
      })
      const normalized = normalizeLandPlotResponse(response)
      setLandPlots(normalized.items)
      setSelectedLandPlotId((current) => current || normalized.items?.[0]?.id)
    } catch {
      // axios interceptor handles error notification
    } finally {
      setLandLoading(false)
    }
  }, [])

  const fetchReport = useCallback(async () => {
    if (!selectedLandPlotId) return

    setReportLoading(true)
    setReportError(null)
    try {
      const response = await CultivationLogService.getLandPlotLogs(selectedLandPlotId)
      setLogs(unwrapItems(response))
    } catch (error) {
      setLogs([])
      setReportError(error)
    } finally {
      setReportLoading(false)
    }
  }, [selectedLandPlotId])

  useEffect(() => {
    fetchLandPlots()
  }, [fetchLandPlots])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const selectedLandPlot = useMemo(
    () => landPlots.find((plot) => plot.id === selectedLandPlotId),
    [landPlots, selectedLandPlotId],
  )

  const filteredLogs = useMemo(() => filterLogsByDate(logs, dateRange), [logs, dateRange])
  const fertilizerRows = useMemo(
    () => aggregateMaterials(filteredLogs, 'fertilizers', 'Phân bón', 'kg'),
    [filteredLogs],
  )
  const pesticideRows = useMemo(
    () => aggregateMaterials(filteredLogs, 'pesticides', 'Nông dược', 'ml'),
    [filteredLogs],
  )

  const totalFertilizerQuantity = useMemo(
    () => fertilizerRows.reduce((sum, item) => sum + item.totalQuantity, 0),
    [fertilizerRows],
  )
  const totalPesticideQuantity = useMemo(
    () => pesticideRows.reduce((sum, item) => sum + item.totalQuantity, 0),
    [pesticideRows],
  )

  const materialColumns = [
    {
      title: 'STT',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Tổng sử dụng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 160,
      render: (value, record) => (
        <Text className="font-bold text-green-700">
          {formatQuantity(value)} {record.unit}
        </Text>
      ),
    },
    {
      title: 'Số lần ghi nhận',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 140,
      render: (value) => <Tag color="blue">{value} lần</Tag>,
    },
    {
      title: 'Số ngày sử dụng',
      dataIndex: 'activeDays',
      key: 'activeDays',
      width: 140,
      render: (value) => <Tag color="green">{value} ngày</Tag>,
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <TitleCustom className="!mb-1 flex items-center gap-2">
            <BarChartOutlined className="text-green-600" />
            Báo cáo thống kê
          </TitleCustom>
          <Text className="text-gray-500">
            Thống kê lượng phân bón và nông dược đã sử dụng theo vùng trồng trong khoảng thời gian.
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReport} loading={reportLoading} disabled={!selectedLandPlotId}>
          Tải lại
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_auto]">
          <Select
            showSearch
            allowClear
            loading={landLoading}
            placeholder="Chọn vùng trồng"
            value={selectedLandPlotId}
            optionFilterProp="label"
            options={landPlots.map((plot) => ({
              value: plot.id,
              label: plot.name || plot.landPlotName || plot.code || 'Vùng trồng',
            }))}
            onChange={(value) => {
              setSelectedLandPlotId(value)
              setLogs([])
            }}
          />
          <RangePicker
            value={dateRange}
            format="DD/MM/YYYY"
            className="w-full"
            onChange={setDateRange}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchReport}
            loading={reportLoading}
            disabled={!selectedLandPlotId}
          >
            Xem báo cáo
          </Button>
        </div>
      </Card>

      {reportError && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải dữ liệu báo cáo"
          description={reportError?.response?.data?.message || 'Vui lòng thử lại sau.'}
        />
      )}

      {!selectedLandPlotId ? (
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <Empty description="Chọn một vùng trồng để xem báo cáo." />
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card bordered={false} className="shadow-sm rounded-2xl">
                <Statistic
                  title="Vùng trồng"
                  value={selectedLandPlot?.name || selectedLandPlot?.landPlotName || 'Đang chọn'}
                  valueStyle={{ fontSize: 18, color: '#166534' }}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} className="shadow-sm rounded-2xl">
                <Statistic
                  title="Tổng phân bón"
                  value={formatQuantity(totalFertilizerQuantity)}
                  suffix={fertilizerRows.length === 1 ? fertilizerRows[0].unit : ''}
                  prefix={<ExperimentOutlined className="text-green-600" />}
                  valueStyle={{ color: '#15803d' }}
                />
                <Text type="secondary">{fertilizerRows.length} loại được ghi nhận</Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered={false} className="shadow-sm rounded-2xl">
                <Statistic
                  title="Tổng nông dược"
                  value={formatQuantity(totalPesticideQuantity)}
                  suffix={pesticideRows.length === 1 ? pesticideRows[0].unit : ''}
                  prefix={<ExperimentOutlined className="text-purple-600" />}
                  valueStyle={{ color: '#7e22ce' }}
                />
                <Text type="secondary">{pesticideRows.length} loại được ghi nhận</Text>
              </Card>
            </Col>
          </Row>

          <Card
            title="Phân bón đã sử dụng"
            bordered={false}
            className="shadow-sm rounded-2xl"
            extra={<Tag color="green">{filteredLogs.length} nhật ký</Tag>}
          >
            <Table
              columns={materialColumns}
              dataSource={fertilizerRows}
              loading={reportLoading}
              rowKey="key"
              pagination={false}
              scroll={{ x: 720 }}
              locale={{ emptyText: 'Không có dữ liệu phân bón trong khoảng thời gian này.' }}
            />
          </Card>

          <Card
            title="Nông dược đã sử dụng"
            bordered={false}
            className="shadow-sm rounded-2xl"
            extra={<Tag color="purple">{filteredLogs.length} nhật ký</Tag>}
          >
            <Table
              columns={materialColumns}
              dataSource={pesticideRows}
              loading={reportLoading}
              rowKey="key"
              pagination={false}
              scroll={{ x: 720 }}
              locale={{ emptyText: 'Không có dữ liệu nông dược trong khoảng thời gian này.' }}
            />
          </Card>
        </>
      )}
    </div>
  )
}

export default ReportStatistics
