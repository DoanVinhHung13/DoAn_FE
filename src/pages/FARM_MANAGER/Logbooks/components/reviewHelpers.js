import { formatDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"

export const unwrap = res => res?.data?.data ?? res?.data ?? res

export const asList = value => (Array.isArray(value) ? value : [])

export const extractList = response => {
  const data = unwrap(response)
  if (Array.isArray(data)) return data
  return asList(data?.items || data?.data)
}

export const AUDIT_ACTION_LABELS = {
  CULTIVATION_LOGBOOK_SUBMIT_COMPLETION: "Gửi yêu cầu duyệt hoàn tất",
  CULTIVATION_LOGBOOK_APPROVE_COMPLETION: "Duyệt hoàn tất nhật ký",
  CULTIVATION_LOGBOOK_REJECT_COMPLETION: "Từ chối hoàn tất nhật ký",
  CULTIVATION_LOGBOOK_CREATE: "Tạo nhật ký canh tác",
  CULTIVATION_LOGBOOK_UPDATE: "Cập nhật nhật ký canh tác",
  PRODUCTION_LOG_DESCRIPTION_EDIT: "Chỉnh sửa mô tả nhật ký",
  CULTIVATION_STAGE_COMPLETED: "Hoàn tất giai đoạn canh tác",
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  APPROVE: "Duyệt",
  REJECT: "Từ chối",
  COMPLETE: "Hoàn tất",
  ASSIGN: "Phân công",
  GENERATE: "Tạo mã",
  DISABLE: "Vô hiệu hóa",
  CANCEL: "Hủy",
  IMPORT: "Nhập dữ liệu",
  EXPORT: "Xuất dữ liệu",
  ADJUST: "Điều chỉnh",
}

export const getAuditAction = item =>
  String(
    item?.action || item?.Action || item?.eventType || item?.EventType || "",
  )
    .trim()
    .toUpperCase()

export const getAuditActionLabel = item => {
  const action = getAuditAction(item)
  if (AUDIT_ACTION_LABELS[action]) return AUDIT_ACTION_LABELS[action]
  if (action.endsWith("_SUBMIT_COMPLETION")) return "Gửi yêu cầu duyệt hoàn tất"
  if (action.endsWith("_APPROVE_COMPLETION")) return "Duyệt hoàn tất nhật ký"
  if (action.endsWith("_REJECT_COMPLETION")) return "Từ chối hoàn tất nhật ký"

  return action
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getAuditEntityId = item =>
  item?.entityId ?? item?.EntityId ?? item?.entityID ?? item?.EntityID ?? null

const getAuditTimestamp = item => {
  const value = item?.createdAt || item?.CreatedAt
  const timestamp = value ? new Date(value).getTime() : NaN
  return Number.isFinite(timestamp) ? timestamp : null
}

const getExpectedGenericAction = action => {
  if (action.endsWith("_APPROVE_COMPLETION")) return "APPROVE"
  if (action.endsWith("_REJECT_COMPLETION")) return "REJECT"
  if (action.endsWith("_SUBMIT_COMPLETION")) return "CREATE"
  return null
}

const isDuplicateAuditPair = (genericItem, detailedItem) => {
  const genericAction = getAuditAction(genericItem)
  const detailedAction = getAuditAction(detailedItem)
  if (getExpectedGenericAction(detailedAction) !== genericAction) return false

  const genericEntityId = getAuditEntityId(genericItem)
  const detailedEntityId = getAuditEntityId(detailedItem)
  if (
    genericEntityId &&
    detailedEntityId &&
    genericEntityId !== detailedEntityId
  ) {
    return false
  }

  const genericTime = getAuditTimestamp(genericItem)
  const detailedTime = getAuditTimestamp(detailedItem)
  if (genericTime === null || detailedTime === null) return true

  return Math.abs(genericTime - detailedTime) <= 30 * 1000
}

export const normalizeAuditLogs = logs => {
  const duplicateIndexes = new Set()

  logs.forEach((item, index) => {
    const action = getAuditAction(item)
    if (!action.endsWith("_COMPLETION")) return

    logs.forEach((candidate, candidateIndex) => {
      if (candidateIndex === index || duplicateIndexes.has(candidateIndex))
        return
      if (isDuplicateAuditPair(candidate, item)) {
        duplicateIndexes.add(candidateIndex)
      }
    })
  })

  return logs.filter((_, index) => !duplicateIndexes.has(index))
}

export const isHarvestTask = task => {
  const activityType = String(task?.activityType || "").trim().toUpperCase()
  const taskType = String(task?.taskType || "").trim().toUpperCase()
  const name = String(task?.name || task?.taskName || "").trim().toLowerCase()
  return (
    activityType === "HARVESTING" ||
    activityType === "HARVEST" ||
    taskType === "HARVEST" ||
    taskType === "HARVESTING" ||
    name.includes("thu hoạch")
  )
}

export const getHarvestInfo = (task, allLogs = [], harvestSummaries = {}) => {
  const leaderSummary = harvestSummaries[task?.id] || {}

  const matchingLog = (allLogs || []).find(log => {
    const logTaskId =
      log?.cultivationTaskId ||
      log?.taskId ||
      log?.workTaskId ||
      log?.task?.id
    if (logTaskId && task?.id && String(logTaskId) === String(task?.id)) {
      return true
    }
    const summary = log?.summary || log?.officialLog || {}
    const summaryTaskId = summary?.cultivationTaskId || summary?.taskId
    if (summaryTaskId && task?.id && String(summaryTaskId) === String(task?.id)) {
      return true
    }
    const logName = String(
      log?.cultivationTaskName ||
        log?.taskName ||
        log?.name ||
        summary?.taskName ||
        summary?.name ||
        "",
    )
      .trim()
      .toLowerCase()
    const taskName = String(task?.name || task?.taskName || "")
      .trim()
      .toLowerCase()
    return Boolean(logName && taskName && logName === taskName)
  })

  const stageLogSummary = matchingLog?.summary || matchingLog?.officialLog || {}

  const quantity =
    leaderSummary.totalHarvestQuantity ??
    leaderSummary.harvestQuantity ??
    stageLogSummary.totalHarvestQuantity ??
    stageLogSummary.harvestQuantity ??
    matchingLog?.totalHarvestQuantity ??
    matchingLog?.harvestQuantity ??
    task?.totalHarvestQuantity ??
    task?.harvestQuantity ??
    null

  const unit =
    leaderSummary.harvestUnit ||
    stageLogSummary.harvestUnit ||
    matchingLog?.harvestUnit ||
    task?.harvestUnit ||
    "kg"

  const area =
    leaderSummary.totalHarvestedArea ??
    stageLogSummary.totalHarvestedArea ??
    matchingLog?.totalHarvestedArea ??
    task?.totalHarvestedArea ??
    task?.executedArea ??
    null

  const areaUnit =
    leaderSummary.harvestAreaUnit ||
    stageLogSummary.harvestAreaUnit ||
    matchingLog?.harvestAreaUnit ||
    task?.harvestAreaUnit ||
    "m²"

  const materialsText =
    leaderSummary.materialsText ||
    stageLogSummary.materialsText ||
    matchingLog?.materialsText ||
    task?.materialsText ||
    ""

  const description =
    leaderSummary.leaderSubmittedDescription ||
    leaderSummary.descriptionSummary ||
    stageLogSummary.supervisorDescription ||
    matchingLog?.supervisorDescription ||
    task?.descriptionSummary ||
    task?.description ||
    ""

  return {
    quantity,
    unit,
    area: Number(area) > 0 ? Number(area) : null,
    areaUnit,
    materialsText,
    description,
    hasYieldData: quantity != null || Number(area) > 0 || Boolean(materialsText),
    matchingLog,
    leaderSummary,
  }
}
