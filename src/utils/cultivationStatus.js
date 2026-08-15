/**
 * Status maps for cultivation entities.
 * Enum `codeValue` lấy từ GET /api/SystemKey?group=...
 * Label ưu tiên từ SystemKey; map dưới đây là fallback + màu Ant Tag.
 */

/** LOGBOOK_STATUS: PLANNED | IN_PROGRESS | COMPLETED | CANCELLED */
export const LOGBOOK_STATUS = {
  PLANNED: { color: 'blue', label: 'Kế hoạch', badgeClass: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện', badgeClass: 'bg-sky-50 text-sky-700' },
  COMPLETED: { color: 'success', label: 'Đã hoàn thành', badgeClass: 'bg-green-50 text-green-700' },
  CANCELLED: { color: 'error', label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-600' },
  CANCELED: { color: 'error', label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-600' },
}

/** REVIEW_STATUS: UNSUBMITTED | WAITING_APPROVAL | APPROVED | REJECTED */
export const REVIEW_STATUS = {
  UNSUBMITTED: { color: 'default', label: 'Chưa nộp' },
  WAITING_APPROVAL: { color: 'gold', label: 'Chờ duyệt' },
  APPROVED: { color: 'success', label: 'Đã duyệt' },
  REJECTED: { color: 'error', label: 'Từ chối' },
  // legacy aliases
  DRAFT: { color: 'default', label: 'Chưa nộp' },
  PENDING_REVIEW: { color: 'gold', label: 'Chờ duyệt' },
}

/** CULTIVATION_STAGE_STATUS: PLANNED | ACTIVE | COMPLETED | CANCELLED */
export const STAGE_STATUS = {
  PLANNED: { color: 'default', label: 'Chưa bắt đầu', avatarBg: '#9ca3af', step: 'wait' },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện', avatarBg: '#3b82f6', step: 'process' },
  COMPLETED: { color: 'success', label: 'Đã hoàn thành', avatarBg: '#16a34a', step: 'finish' },
  CANCELLED: { color: 'error', label: 'Đã hủy', avatarBg: '#ef4444', step: 'error' },
  // legacy aliases
  PENDING: { color: 'default', label: 'Chưa bắt đầu', avatarBg: '#9ca3af', step: 'wait' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện', avatarBg: '#3b82f6', step: 'process' },
}

/**
 * WORK_TASK_STATUS:
 * PENDING | ASSIGNED | IN_PROGRESS | WAITING_APPROVAL | COMPLETED | OVERDUE | CANCELLED
 */
export const TASK_STATUS = {
  PENDING: { color: 'default', label: 'Chưa kích hoạt' },
  ASSIGNED: { color: 'blue', label: 'Đã phân công' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện' },
  WAITING_APPROVAL: { color: 'gold', label: 'Chờ phê duyệt' },
  COMPLETED: { color: 'success', label: 'Đã hoàn thành' },
  OVERDUE: { color: 'error', label: 'Quá hạn' },
  CANCELLED: { color: 'default', label: 'Đã hủy' },
  // legacy alias — API hiện dùng IN_PROGRESS
  ACTIVE: { color: 'processing', label: 'Đang thực hiện' },
}

/** HARVEST_BATCH_STATUS: CREATED | IN_STORAGE | SOLD | EXPIRED | RECALLED */
export const HARVEST_BATCH_STATUS = {
  CREATED: { color: 'purple', label: 'Đã tạo' },
  IN_STORAGE: { color: 'green', label: 'Đang lưu kho' },
  SOLD: { color: 'teal', label: 'Đã bán' },
  EXPIRED: { color: 'orange', label: 'Đã hết hạn' },
  RECALLED: { color: 'red', label: 'Đã thu hồi' },
}

/** EQUIPMENT_STATUS: AVAILABLE | IN_USE | MAINTENANCE | BROKEN | RETIRED */
export const EQUIPMENT_STATUS = {
  AVAILABLE: { color: 'green', label: 'Sẵn sàng' },
  IN_USE: { color: 'blue', label: 'Đang sử dụng' },
  MAINTENANCE: { color: 'warning', label: 'Đang bảo trì' },
  BROKEN: { color: 'error', label: 'Hỏng' },
  RETIRED: { color: 'default', label: 'Đã thanh lý' },
  // legacy
  ACTIVE: { color: 'green', label: 'Sẵn sàng' },
}

const optionLabel = (opt) => opt?.description || opt?.Description || opt?.label || opt?.Label || ''

const optionValue = (opt) => opt?.codeValue ?? opt?.CodeValue ?? opt?.value ?? opt?.Value

/** Merge SystemKey option label vào fallback meta */
export const resolveStatusMeta = (status, fallbackMap, systemKeyOptions = []) => {
  const fallback = fallbackMap[status] || {
    color: 'default',
    label: status || '—',
    badgeClass: 'bg-gray-100 text-gray-600',
  }
  if (!status || !systemKeyOptions?.length) return fallback

  const found = systemKeyOptions.find((opt) => String(optionValue(opt)) === String(status))
  const label = optionLabel(found)
  if (!label) return fallback
  return { ...fallback, label }
}

export const toFilterOptions = (systemKeyOptions = [], allLabel = 'Tất cả trạng thái') => {
  const options = Array.isArray(systemKeyOptions) ? systemKeyOptions : []
  return [
    { value: 'all', label: allLabel },
    ...options
      .map((opt) => ({
        value: optionValue(opt),
        label: optionLabel(opt) || String(optionValue(opt) ?? ''),
      }))
      .filter((opt) => opt.value != null && opt.value !== ''),
  ]
}

export const LOGBOOK_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'PLANNED', label: 'Kế hoạch' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export const CLOSING_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'WAITING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'COMPLETED', label: 'Đã hoàn thành' },
]

export const getLogbookStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, LOGBOOK_STATUS, systemKeyOptions)

export const getReviewStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, REVIEW_STATUS, systemKeyOptions)

export const getStageStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, STAGE_STATUS, systemKeyOptions)

export const getTaskStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, TASK_STATUS, systemKeyOptions)

export const getHarvestBatchStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, HARVEST_BATCH_STATUS, systemKeyOptions)

export const getEquipmentStatus = (status, systemKeyOptions) =>
  resolveStatusMeta(status, EQUIPMENT_STATUS, systemKeyOptions)

/** FL can write daily logs only when task is in progress (not when merely assigned) */
export const canWriteDailyLog = (status) =>
  status === 'IN_PROGRESS'

/** FS can compile when leader submitted summary */
export const canCompileTask = (status) => status === 'WAITING_APPROVAL'

/** FM can approve closing when review is waiting */
export const canApproveClosing = (logbook) => {
  const review = logbook?.reviewStatus
  return review === 'WAITING_APPROVAL' || review === 'PENDING_REVIEW'
}

/** Only stages that have not started may change their task order. */
export const canReorderStageTasks = (stage, logbook) => {
  if (!stage) return false
  if (['COMPLETED', 'WAITING_APPROVAL', 'APPROVED'].includes(logbook?.status)) return false
  if (['WAITING_APPROVAL', 'APPROVED'].includes(logbook?.reviewStatus)) return false
  return stage.status === 'PLANNED' || stage.status === 'PENDING'
}

/** A task that is already assigned/started/completed is immutable in the order. */
export const canReorderTask = (task) =>
  !task?.status || task.status === 'PENDING'

export const canReorderTaskList = (tasks) =>
  Array.isArray(tasks) && tasks.every(canReorderTask)
