import { formatDate } from "src/utils/dateFormatters"

const getLogDate = (log, type) => {
  const summary = log?.summary || log?.officialLog || {}
  const dateKey = type === "start" ? "workStartDate" : "workEndDate"
  const fallbackKey = type === "start" ? "startDate" : "endDate"
  return (
    log?.[dateKey] ||
    summary?.[dateKey] ||
    log?.[fallbackKey] ||
    summary?.[fallbackKey]
  )
}

const StageSectionHeader = ({ stage, index, stageLogs = [] }) => {
  if (!stage) return null

  const firstLog = stageLogs[0]
  const lastLog = stageLogs[stageLogs.length - 1]
  const stageName =
    stage.stageName || stage.name || stage.title || `Giai đoạn ${index + 1}`
  const plannedStart = stage.startDate || stage.plannedStartDate
  const plannedEnd = stage.endDate || stage.plannedEndDate
  const actualStart = stage.actualStartDate || getLogDate(firstLog, "start")
  const actualEnd = stage.actualEndDate || getLogDate(lastLog, "end")

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-green-100">
      <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-green-600 rounded-full shrink-0">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-base font-bold text-gray-800">{stageName}</h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="text-gray-500">
            Kế hoạch:{" "}
            {plannedStart ? formatDate(plannedStart) : "Chưa xác định"}
          </span>
          <span className="font-medium text-green-600">
            Thực tế: {actualStart ? formatDate(actualStart) : "Chưa bắt đầu"} -{" "}
            {actualEnd
              ? formatDate(actualEnd)
              : actualStart
                ? "Đang thực hiện"
                : "Chưa xác định"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StageSectionHeader

