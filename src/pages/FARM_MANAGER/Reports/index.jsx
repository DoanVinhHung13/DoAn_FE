import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Empty,
  Col,
  Row,
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

import TitleCustom from 'src/components/TitleCustom'
import ReportService from 'src/services/ReportService'
import { getLocalNow } from 'src/utils/dateFormatters'

const { RangePicker } = DatePicker
const { Text } = Typography

const unwrapReportRows = (response) => {
  const payload = response?.data ?? response ?? {}
  const rows = payload?.rows ?? payload?.Rows ?? []

  if (!Array.isArray(rows)) return []

  return rows.map((row, index) => {
    const name = row?.Material ?? row?.material ?? row?.materialName ?? 'Vật tư'
    const unit = row?.Unit ?? row?.unit ?? '—'
    const quantity = Number(row?.QuantityUsed ?? row?.quantityUsed ?? row?.quantity ?? 0)

    return {
      key: `${name}-${unit}-${index}`,
      name,
      unit,
      totalQuantity: Number.isFinite(quantity) ? quantity : 0,
    }
  })
}

const formatQuantity = (value) =>
  Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 3,
  })

const ReportStatistics = () => {
  const [dateRange, setDateRange] = useState([
    getLocalNow().subtract(30, 'day'),
    getLocalNow(),
  ])
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [reportRows, setReportRows] = useState([])

  const fetchReport = useCallback(async () => {
    setReportLoading(true)
    setReportError(null)

    try {
      const response = await ReportService.getMaterialUsageReport({
        DateFrom: dateRange?.[0]?.format('YYYY-MM-DD'),
        DateTo: dateRange?.[1]?.format('YYYY-MM-DD'),
      })
      setReportRows(unwrapReportRows(response))
    } catch (error) {
      setReportRows([])
      setReportError(error)
    } finally {
      setReportLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const totalQuantity = useMemo(
    () => reportRows.reduce((sum, item) => sum + item.totalQuantity, 0),
    [reportRows],
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
      width: 180,
      render: (value, record) => (
        <Text className="font-bold text-green-700">
          {formatQuantity(value)} {record.unit}
        </Text>
      ),
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <TitleCustom className="!mb-1 flex items-center gap-2">
            <BarChartOutlined className="text-green-600" />
            Báo cáo sử dụng vật tư
          </TitleCustom>
          <Text className="text-gray-500">
            Dữ liệu được lấy từ API báo cáo tổng hợp vật tư của hệ thống.
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchReport}
          loading={reportLoading}
        >
          Tải lại
        </Button>
      </div>

      <Card bordered={false} className="rounded-2xl shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <RangePicker
            value={dateRange}
            format="DD/MM/YYYY"
            onChange={setDateRange}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={fetchReport}
            loading={reportLoading}
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
          description={reportError?.message || 'Vui lòng thử lại sau.'}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card bordered={false} className="rounded-2xl shadow-sm">
            <Statistic
              title="Tổng vật tư đã sử dụng"
              value={formatQuantity(totalQuantity)}
              prefix={<ExperimentOutlined className="text-green-600" />}
              valueStyle={{ color: '#15803d' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="rounded-2xl shadow-sm">
            <Statistic
              title="Số loại vật tư"
              value={reportRows.length}
              suffix="loại"
              valueStyle={{ color: '#166534' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Vật tư đã sử dụng"
        bordered={false}
        className="rounded-2xl shadow-sm"
        extra={<Tag color="green">{reportRows.length} loại vật tư</Tag>}
      >
        {reportRows.length === 0 && !reportLoading ? (
          <Empty description="Không có dữ liệu vật tư trong khoảng thời gian này." />
        ) : (
          <Table
            columns={materialColumns}
            dataSource={reportRows}
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
