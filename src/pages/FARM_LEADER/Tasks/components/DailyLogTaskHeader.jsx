import React from "react"
import { Alert, Button, Card, Tag, Typography } from "antd"
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons"
import TitleCustom from "src/components/TitleCustom"
import { formatDate } from "src/utils/dateFormatters"

const { Text } = Typography

const DailyLogTaskHeader = ({
  task,
  statusCfg,
  isViewOnly,
  displayStartDate,
  displayStartLabel,
  actualEndDate,
  onBack,
  onOpenSummaryModal,
}) => {
  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="mb-3 -ml-2 text-gray-600 h-9 hover:text-green-700"
      >
        Quay lại danh sách công việc
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mt-2">
            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
            {task.taskCatalogName && (
              <Tag color="blue">{task.taskCatalogName}</Tag>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <TitleCustom className="!mb-0 text-xl md:text-2xl line-clamp-1">
              {task.name}
            </TitleCustom>
            {task.status === "WAITING_APPROVAL" ? (
              <Button
                type="default"
                icon={<FileTextOutlined />}
                onClick={onOpenSummaryModal}
                className="h-10 px-5 font-semibold rounded-xl border-emerald-500 text-emerald-600 hover:!bg-emerald-50 shrink-0"
              >
                Xem lại bản tổng hợp đã gửi
              </Button>
            ) : (
              !isViewOnly && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={onOpenSummaryModal}
                  className="h-10 px-5 font-semibold rounded-xl bg-emerald-600 border-emerald-600 hover:!bg-emerald-700 hover:!border-emerald-700 shrink-0"
                >
                  Hoàn thành & gửi bản tổng hợp
                </Button>
              )
            )}
          </div>
          {task.description && (
            <div className="mt-2 min-w-0 max-w-full text-sm text-gray-600 break-words [overflow-wrap:anywhere]">
              {task.description}
            </div>
          )}
          <div className="grid gap-2 mt-3 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-5">
            <span>
              <strong>{displayStartLabel}:</strong>{" "}
              {displayStartDate ? formatDate(displayStartDate) : "—"}
            </span>
            <span>
              <strong>Kết thúc thực tế:</strong>{" "}
              {actualEndDate ? formatDate(actualEndDate) : "Chưa hoàn thành"}
            </span>
            <span>
              <strong>Hoàn thành:</strong>{" "}
              {task.completedDate ? formatDate(task.completedDate) : "—"}
            </span>
          </div>
          {task.isActivationWarning === true && (
            <Alert
              type="warning"
              showIcon
              className="mt-3 rounded-xl"
              message="Công việc đã đến ngày dự kiến kích hoạt nhưng hiện chưa được kích hoạt."
            />
          )}
        </div>
      </div>

      {(task.cultivationLogbookName || task.cultivationStageName) && (
        <Card
          bordered={false}
          className="border border-green-100 shadow-sm rounded-2xl bg-green-50/40 mt-4"
        >
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <Text type="secondary" className="text-xs">
                Kế hoạch canh tác
              </Text>
              <div className="mt-1 font-semibold text-gray-800">
                {task.cultivationLogbookName || "—"}
              </div>
            </div>
            <div>
              <Text type="secondary" className="text-xs">
                Giai đoạn
              </Text>
              <div className="mt-1 font-semibold text-gray-800">
                {task.cultivationStageName || "—"}
              </div>
            </div>
          </div>
        </Card>
      )}

      {task.status === "WAITING_APPROVAL" && (
        <Alert
          type="info"
          message="Đã gửi bản tổng hợp cho giám sát viên biên soạn."
          className="rounded-xl mt-4"
        />
      )}
    </div>
  )
}

export default DailyLogTaskHeader
