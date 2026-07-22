/**
 * Status maps for cultivation logbooks / tasks — exact API enums.
 * Source: live GET /cultivation-logbooks, /cultivation-tasks
 */

export const LOGBOOK_STATUS = {
  DRAFT: { color: 'default', label: 'Nháp', badgeClass: 'bg-gray-100 text-gray-600' },
  PLANNED: { color: 'blue', label: 'Đã lên kế hoạch', badgeClass: 'bg-blue-50 text-blue-700' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện', badgeClass: 'bg-sky-50 text-sky-700' },
  COMPLETED: { color: 'success', label: 'Hoàn thành', badgeClass: 'bg-green-50 text-green-700' },
  CANCELLED: { color: 'error', label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-600' },
  CANCELED: { color: 'error', label: 'Đã hủy', badgeClass: 'bg-red-50 text-red-600' },
  PENDING_COMPLETION: { color: 'gold', label: 'Chờ chốt sổ', badgeClass: 'bg-amber-50 text-amber-700' },
  PENDING_REVIEW: { color: 'gold', label: 'Chờ duyệt', badgeClass: 'bg-amber-50 text-amber-700' },
  APPROVED: { color: 'success', label: 'Đã duyệt', badgeClass: 'bg-green-50 text-green-700' },
  REJECTED: { color: 'error', label: 'Từ chối', badgeClass: 'bg-red-50 text-red-600' },
}

export const REVIEW_STATUS = {
  DRAFT: { color: 'default', label: 'Chưa gửi' },
  PENDING_REVIEW: { color: 'gold', label: 'Chờ duyệt' },
  APPROVED: { color: 'success', label: 'Đã duyệt' },
  REJECTED: { color: 'error', label: 'Từ chối' },
}

export const TASK_STATUS = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt' },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện' },
  WAITING_APPROVAL: { color: 'gold', label: 'Chờ duyệt' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
}

export const LOGBOOK_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'PLANNED', label: 'Đã lên kế hoạch' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export const CLOSING_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'PENDING_COMPLETION', label: 'Chờ chốt sổ' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]

export const getLogbookStatus = (status) =>
  LOGBOOK_STATUS[status] || { color: 'default', label: status || '—', badgeClass: 'bg-gray-100 text-gray-600' }

export const getReviewStatus = (status) =>
  REVIEW_STATUS[status] || { color: 'default', label: status || '—' }

export const getTaskStatus = (status) =>
  TASK_STATUS[status] || { color: 'default', label: status || '—' }

/** FL can write daily logs when task is in progress */
export const canWriteDailyLog = (status) =>
  status === 'IN_PROGRESS' || status === 'ACTIVE'

/** FS can compile when leader submitted summary */
export const canCompileTask = (status) =>
  status === 'WAITING_APPROVAL'

/** FM can approve closing when pending review/completion */
export const canApproveClosing = (logbook) => {
  const status = logbook?.status
  const review = logbook?.reviewStatus
  return (
    status === 'PENDING_COMPLETION' ||
    status === 'PENDING_REVIEW' ||
    review === 'PENDING_REVIEW'
  )
}

/** Closing list filter: match status or reviewStatus */
export const matchesClosingFilter = (logbook, filter) => {
  if (filter === 'all') return true
  if (logbook?.status === filter) return true
  if (filter === 'APPROVED' || filter === 'REJECTED' || filter === 'PENDING_REVIEW') {
    return logbook?.reviewStatus === filter
  }
  return false
}
