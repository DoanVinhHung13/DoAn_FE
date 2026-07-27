export const NOTIFICATION_TYPE_LABELS = {
  Announcement: 'Thông báo chung',
  System: 'Hệ thống',
  Journal_Assigned: 'Phân công',
  Journal_Submitted: 'Gửi duyệt',
  Journal_Verified: 'Đã duyệt',
  Journal_Revision_Requested: 'Cần chỉnh sửa',
  CULTIVATION_LOGBOOK_COMPLETION_SUBMITTED: 'Yêu cầu kết thúc nhật ký',
  CULTIVATION_LOGBOOK_COMPLETION_APPROVED: 'Đã duyệt kết thúc nhật ký',
  CULTIVATION_LOGBOOK_COMPLETION_REJECTED: 'Từ chối kết thúc nhật ký',
  CULTIVATION_TASK_ASSIGNED: 'Được phân công công việc',
  CULTIVATION_TASK_STARTED: 'Công việc bắt đầu',
  CULTIVATION_TASK_COMPLETED: 'Công việc hoàn thành',
  CULTIVATION_TASK_CANCELLED: 'Công việc bị huỷ',
  CULTIVATION_TASK_SUMMARY_SUBMITTED: 'Bản tổng hợp chờ xử lý',
  CULTIVATION_TASK_SUMMARY_REJECTED: 'Bản tổng hợp bị từ chối',
  CULTIVATION_LOG_APPROVED: 'Nhật ký sản xuất đã duyệt',
  CULTIVATION_LOG_REJECTED: 'Nhật ký sản xuất bị từ chối',
  CULTIVATION_STAGE_COMPLETED: 'Giai đoạn đã hoàn thành',
  CULTIVATION_STAGE_REVIEW_SUBMITTED: 'Giai đoạn chờ xử lý',
  CULTIVATION_STAGE_REVIEW_APPROVED: 'Giai đoạn đã xử lý',
  CULTIVATION_STAGE_REVIEW_REJECTED: 'Giai đoạn bị từ chối',
};

export const NOTIFICATION_TYPE_COLORS = {
  Journal_Submitted: 'blue',
  Journal_Verified: 'green',
  Journal_Revision_Requested: 'orange',
  Journal_Assigned: 'purple',
  Announcement: 'magenta',
  System: 'cyan',
  CULTIVATION_LOGBOOK_COMPLETION_SUBMITTED: 'blue',
  CULTIVATION_LOGBOOK_COMPLETION_APPROVED: 'green',
  CULTIVATION_LOGBOOK_COMPLETION_REJECTED: 'orange',
  CULTIVATION_TASK_ASSIGNED: 'purple',
  CULTIVATION_TASK_STARTED: 'blue',
  CULTIVATION_TASK_COMPLETED: 'green',
  CULTIVATION_TASK_CANCELLED: 'red',
  CULTIVATION_TASK_SUMMARY_SUBMITTED: 'blue',
  CULTIVATION_TASK_SUMMARY_REJECTED: 'orange',
  CULTIVATION_LOG_APPROVED: 'green',
  CULTIVATION_LOG_REJECTED: 'orange',
  CULTIVATION_STAGE_COMPLETED: 'green',
  CULTIVATION_STAGE_REVIEW_SUBMITTED: 'blue',
  CULTIVATION_STAGE_REVIEW_APPROVED: 'green',
  CULTIVATION_STAGE_REVIEW_REJECTED: 'orange',
};

export const getNotificationTypeLabel = (notification) =>
  NOTIFICATION_TYPE_LABELS[notification?.type] ||
  notification?.categoryLabel ||
  notification?.typeLabel ||
  notification?.category ||
  'Thông báo';
