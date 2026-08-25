import React from "react"
import { Button, Card, DatePicker, Select, Tabs, Typography } from "antd"
import { FieldTimeOutlined, SearchOutlined } from "@ant-design/icons"

import { REPORT_META, REPORT_TYPES } from "./reportUtils"

const { RangePicker } = DatePicker
const { Text } = Typography

const ReportFilterToolbar = ({
  activeReport,
  setActiveReport,
  onResetReportError,
  dateRange,
  setDateRange,
  selectedCropId,
  setSelectedCropId,
  cropOptions,
  isCropsLoading,
  onFetchReport,
  reportLoading,
}) => {
  const currentMeta = REPORT_META[activeReport]

  return (
    <>
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
            onResetReportError?.()
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
              onClick={() => onFetchReport()}
              loading={reportLoading}
            >
              Xem báo cáo
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReportFilterToolbar
