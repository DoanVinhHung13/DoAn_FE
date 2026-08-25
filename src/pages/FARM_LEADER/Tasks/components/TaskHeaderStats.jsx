import React from "react"
import { Card, Progress, Tag, Typography } from "antd"
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  NodeIndexOutlined,
  TagsOutlined,
} from "@ant-design/icons"

import { formatDate } from "src/utils/dateFormatters"
import { getLandPlotNamesDisplay } from "src/utils/helpers"
import QuarantineSummary from "src/components/QuarantineSummary"

const { Text } = Typography

const TaskHeaderStats = ({
  logbookDetail,
  planStats,
  quarantineWarnings,
  statusFilter,
  setStatusFilter,
}) => {
  const filterTabs = [
    { key: "IN_PROGRESS", label: "Đang làm" },
    { key: "PENDING", label: "Chưa bắt đầu" },
    { key: "COMPLETED", label: "Hoàn thành" },
    { key: "all", label: "Tất cả" },
  ]

  return (
    <Card
      bordered={false}
      className="overflow-hidden border shadow-xs rounded-2xl border-slate-200/80 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white relative"
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Kế hoạch đang chọn
            </span>
            {logbookDetail?.code && (
              <span className="text-xs text-emerald-200/60 font-mono">
                #{logbookDetail.code}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black tracking-tight text-white md:text-2xl">
            {logbookDetail?.name || "Chi tiết kế hoạch"}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-emerald-100/70 pt-1">
            <span className="flex items-center gap-1.5">
              <TagsOutlined className="text-emerald-400" />
              {logbookDetail?.cropName || logbookDetail?.cropCatalogName || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <EnvironmentOutlined className="text-emerald-400" />
              {getLandPlotNamesDisplay(logbookDetail)}
            </span>
            {logbookDetail?.startDate && (
              <span className="flex items-center gap-1.5">
                <CalendarOutlined className="text-emerald-400" />
                {formatDate(logbookDetail.startDate)}
                {logbookDetail.endDate
                  ? ` → ${formatDate(logbookDetail.endDate)}`
                  : ""}
              </span>
            )}
          </div>
        </div>

        {/* Progress Circular Stats */}
        <div className="flex items-center gap-6 p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 shrink-0">
          <Progress
            type="circle"
            percent={planStats.pct}
            size={68}
            strokeColor="#10b981"
            trailColor="rgba(255,255,255,0.15)"
            strokeWidth={8}
            format={pct => (
              <span className="text-sm font-bold text-white">{pct}%</span>
            )}
          />
          <div className="space-y-1 text-xs">
            <div className="text-emerald-200/70">Tiến độ chung</div>
            <div className="text-base font-bold text-white">
              {planStats.completed}/{planStats.total} công việc
            </div>
            <div className="text-[11px] text-emerald-400/90 font-medium">
              {planStats.active} công việc đang thực hiện
            </div>
          </div>
        </div>
      </div>

      {quarantineWarnings.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <QuarantineSummary warnings={quarantineWarnings} />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-4 mt-5 border-t border-white/10 overflow-x-auto">
        <span className="text-xs text-emerald-200/60 font-semibold mr-1 shrink-0">
          Trạng thái:
        </span>
        {filterTabs.map(tab => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                active
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "bg-white/10 text-emerald-100/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export default TaskHeaderStats
