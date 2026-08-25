import React from "react"
import { Alert, Avatar, Button, Card, Tag, Tooltip, Typography } from "antd"
import {
  CalendarOutlined,
  CrownOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons"

import { canWriteDailyLog } from "src/utils/cultivationStatus"
import { formatDate } from "src/utils/dateFormatters"

const { Text, Paragraph } = Typography

export const taskOrderValue = (task, fallback = 0) => {
  const order = Number(task?.taskOrder)
  return Number.isFinite(order) && order > 0 ? order : fallback
}

export const orderTasks = tasks =>
  tasks
    .map((task, index) => ({ task, index }))
    .sort(
      (a, b) =>
        taskOrderValue(a.task, Number.MAX_SAFE_INTEGER) -
          taskOrderValue(b.task, Number.MAX_SAFE_INTEGER) || a.index - b.index,
    )
    .map(({ task }) => task)

const TaskCard = ({ task, taskIndex, onOpen, getTaskStatus }) => {
  const cfg = getTaskStatus(task.status)
  const canLog = canWriteDailyLog(task.status)
  const taskNumber = taskOrderValue(task, taskIndex + 1)
  const displayStartDate = task.workStartDate || task.plannedStartDate
  const displayStartLabel = task.workStartDate ? "Ngày bắt đầu" : "Dự kiến"

  let ctaLabel = "Xem chi tiết"
  let ctaIcon = <EyeOutlined />
  let ctaStyle = "bg-slate-800 hover:bg-slate-900 text-white"

  if (canLog) {
    ctaLabel = "Ghi nhật ký hàng ngày"
    ctaIcon = <FileTextOutlined />
    ctaStyle = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
  } else if (task.status === "WAITING_APPROVAL") {
    ctaLabel = "Xem báo cáo đã gửi"
    ctaIcon = <EyeOutlined />
    ctaStyle = "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
  } else if (task.status === "PENDING") {
    ctaLabel = "Chưa bắt đầu"
    ctaStyle = "bg-slate-300 text-slate-600 cursor-not-allowed"
  }

  const assignments = task.assignments || []
  const leader =
    assignments.find(a => a.isLeader) ||
    (task.assignedLeaderName
      ? { fullName: task.assignedLeaderName, isLeader: true }
      : null)
  const members = assignments.filter(a => !a.isLeader)

  return (
    <Card
      bordered={false}
      className="flex flex-col justify-between h-full overflow-hidden transition-all duration-300 bg-white border shadow-xs border-slate-200/80 hover:border-emerald-400 hover:shadow-md rounded-2xl group"
      styles={{
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      {/* Top Banner Header */}
      <div className="px-4 py-3 transition-colors border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-emerald-50/15 to-white group-hover:from-emerald-50/30">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center min-w-0 gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700"
              aria-label={`Số thứ tự ${taskNumber}`}
            >
              {taskNumber}
            </span>
            <h3
              className="text-base font-bold transition-colors text-slate-800 group-hover:text-emerald-700 line-clamp-1"
              title={task.name || task.taskName}
            >
              {task.name || task.taskName}
            </h3>
          </div>
          <Tag
            color={cfg.color}
            className="rounded-full px-3 py-0.5 text-xs font-semibold m-0 shadow-2xs flex-shrink-0"
          >
            {cfg.label}
          </Tag>
        </div>

        {task.description ? (
          <Paragraph
            type="secondary"
            className="!mb-0 text-xs text-slate-500 line-clamp-2"
            title={task.description}
          >
            {task.description}
          </Paragraph>
        ) : (
          <span className="text-xs italic text-slate-400">
            Không có mô tả chi tiết
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="flex flex-1 flex-col justify-between space-y-3.5 p-4 pt-3">
        <div className="space-y-3">
          {/* Schedule / Dates */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/80 text-xs">
            <Text
              type="secondary"
              className="block text-[10px] uppercase font-semibold text-slate-400"
            >
              {displayStartLabel}
            </Text>
            <Text strong className="text-xs text-slate-700">
              <CalendarOutlined className="mr-1 text-emerald-600" />
              {displayStartDate ? formatDate(displayStartDate) : "—"}
            </Text>
            {task.completedDate && (
              <Text className="block mt-1 text-xs text-green-600">
                Ngày hoàn thành: {formatDate(task.completedDate)}
              </Text>
            )}
          </div>

          {task.isActivationWarning === true && (
            <Alert
              type="warning"
              showIcon
              className="!rounded-xl !border-amber-200 !bg-amber-50/80 !px-3 !py-2"
              message="Đã đến ngày kích hoạt nhưng công việc chưa được kích hoạt."
            />
          )}

          {Array.isArray(task.inlineQuarantineWarnings) &&
            task.inlineQuarantineWarnings.map((warning, index) => (
              <Alert
                key={`${warning.pesticideName}-${warning.eligibleDate}-${index}`}
                type="warning"
                icon={<WarningOutlined />}
                className="!rounded-xl !border-amber-200 !bg-amber-50/80 !px-3 !py-2"
                message={
                  <span className="text-xs font-semibold text-amber-800">
                    Chưa đủ thời gian cách ly: {warning.pesticideName}.
                  </span>
                }
                description={
                  <span className="text-xs text-amber-700">
                    Thời gian cách ly đến: {formatDate(warning.eligibleDate)}.
                  </span>
                }
              />
            ))}

          {/* Team Assignment */}
          <div className="space-y-1.5 pt-0.5">
            <Text
              type="secondary"
              className="text-xs font-medium text-slate-500 flex items-center gap-1.5"
            >
              <TeamOutlined className="text-emerald-600" /> Thành viên nhóm
            </Text>
            <div className="flex flex-wrap items-center gap-1.5">
              {leader && (
                <Tooltip title={`Tổ trưởng: ${leader.fullName}`}>
                  <Tag
                    color="gold"
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 border-amber-200"
                  >
                    <CrownOutlined className="text-amber-600" />
                    <span className="max-w-[130px] truncate">
                      {leader.fullName}
                    </span>
                  </Tag>
                </Tooltip>
              )}
              {members.length > 0 ? (
                <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                  {members.map((m, idx) => (
                    <Tooltip key={m.userId || idx} title={m.fullName}>
                      <Avatar
                        size={26}
                        className="bg-emerald-600 text-[11px] font-bold border-2 border-white shadow-2xs"
                      >
                        {m.fullName?.charAt(0)?.toUpperCase() || "F"}
                      </Avatar>
                    </Tooltip>
                  ))}
                  <Text type="secondary" className="ml-2 text-xs font-medium">
                    +{members.length} người
                  </Text>
                </div>
              ) : (
                !leader && (
                  <Text
                    type="secondary"
                    className="text-xs italic text-slate-400"
                  >
                    Chưa phân công
                  </Text>
                )
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="primary"
          icon={ctaIcon}
          disabled={task.status === "PENDING"}
          onClick={() => {
            if (task.status === "PENDING") {
              return
            }
            onOpen(task.id)
          }}
          className={`w-full h-9 rounded-xl font-semibold border-0 mt-3 transition-all ${ctaStyle}`}
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  )
}

export default TaskCard
