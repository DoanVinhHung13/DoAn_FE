export const CULTIVATION_TASK_TYPES = {
  MATERIAL: 'MATERIAL',
  HARVEST: 'HARVEST',
  NON_MATERIAL: 'NON_MATERIAL',
}

export const CULTIVATION_TASK_TYPE_LABELS = {
  MATERIAL: 'Vật tư',
  HARVEST: 'Thu hoạch',
  NON_MATERIAL: 'Không vật tư',
}

export const CULTIVATION_TASK_TYPE_OPTIONS = Object.entries(CULTIVATION_TASK_TYPES).map(([key, value]) => ({
  value,
  label: CULTIVATION_TASK_TYPE_LABELS[key],
}))

export const normalizeCultivationTaskType = value => {
  const normalized = String(value || '').toUpperCase()
  return Object.values(CULTIVATION_TASK_TYPES).includes(normalized) ? normalized : null
}

export const getCultivationTaskTypeLabel = value =>
  CULTIVATION_TASK_TYPE_LABELS[normalizeCultivationTaskType(value)] || '—'

export const TASK_SCHEDULING_ERROR_MESSAGES = {
  ASSIGNEE_PHASE_TASK_LIMIT_EXCEEDED: 'Người phụ trách đã có tối đa 3 công việc đang hoạt động trong giai đoạn này.',
  ASSIGNEE_SCHEDULE_OVERLAP: 'Người phụ trách đã có công việc khác trong khoảng thời gian này.',
  TASK_ASSIGNMENT_CONFLICT: 'Không thể giao công việc do dữ liệu phân công vừa thay đổi. Vui lòng thử lại.',
}

export const getTaskSchedulingErrorMessage = error =>
  TASK_SCHEDULING_ERROR_MESSAGES[error?.code] || error?.message || 'Không thể cập nhật công việc. Vui lòng thử lại.'

export const toTaskApiDateTime = value => {
  if (!value) return null
  if (typeof value?.toISOString === 'function') return value.toISOString()
  return value
}
