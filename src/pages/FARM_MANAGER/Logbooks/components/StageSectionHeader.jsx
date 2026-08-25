import { formatDate } from "src/utils/dateFormatters"

const getLogDate = (log, type) => {
  const summary = log?.summary || log?.officialLog || {}
  const dateKey = type === "start" ? "workStartDate" : "workEndDate"
  return (
    log?.[dateKey] ||
    summary?.[dateKey]
  )
}

const StageSectionHeader = ({ stage, index, stageLogs = [] }) => {
  if (!stage) return null

  const firstLog = stageLogs[0]
  const stageName =
    stage.stageName || stage.name || stage.title || `Giai đoạn ${index + 1}`
  const actualStart = stage.actualStartDate || getLogDate(firstLog, "start")
  const actualEnd = stage.actualEndDate
  const displayStart = actualStart || stage.startDate
  const displayLabel = actualStart ? "Ngày bắt đầu" : "Dự kiến"

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-green-100">
      <div className="flex items-center justify-center w-8 h-8 font-bold text-white bg-green-600 rounded-full shrink-0">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 text-base font-bold text-gray-800">{stageName}</h3>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
          <span className="text-gray-500">
            {displayStart
              ? `${displayLabel}: ${formatDate(displayStart)}`
              : ""}
          </span>
          {actualEnd && (
            <span className="font-medium text-green-600">
              Kết thúc thực tế: {formatDate(actualEnd)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default StageSectionHeader
