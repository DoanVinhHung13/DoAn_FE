/**
 * Shared helpers for Supervisor biên soạn nhật ký từ leader-summary.
 */
import CultivationTaskService from 'src/services/CultivationTaskService'
import CultivationLogService from 'src/services/CultivationLogService'

export const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const buildDataSentence = (summary) => {
  if (!summary) return 'Chưa có số liệu'
  const parts = []
  ;(summary.fertilizers || []).forEach((f) => {
    parts.push(
      `Đã bón ${f.totalQuantity ?? f.quantity} ${f.quantityUnit ?? f.unit} ${f.name}` +
        (f.totalArea != null ? ` cho ${f.totalArea} ${f.areaUnit}` : '')
    )
  })
  ;(summary.pesticides || []).forEach((p) => {
    parts.push(
      `Đã phun ${p.totalQuantity ?? p.quantity} ${p.quantityUnit ?? p.unit} ${p.name}` +
        (p.totalArea != null ? ` cho ${p.totalArea} ${p.areaUnit}` : '')
    )
  })
  return parts.length ? parts.join('. ') : 'Không có số liệu phân bón/thuốc BVTV'
}

/** Load leader-summary + resolve cultivationLogId for a task. */
export const loadLeaderCompileData = async (taskId) => {
  const [summaryRes, taskRes] = await Promise.all([
    CultivationTaskService.getLeaderSummary(taskId),
    CultivationTaskService.getById(taskId),
  ])
  const summary = unwrap(summaryRes) || null
  const taskDetail = unwrap(taskRes) || null
  const officialLogId =
    taskDetail?.cultivationLogId || summary?.cultivationLogId || null
  const isApproved = taskDetail?.status === 'COMPLETED'
  return { summary, taskDetail, officialLogId, isApproved }
}

/** PATCH description rồi approve official log. */
export const saveCompiledDescription = async (officialLogId, description) => {
  await CultivationLogService.patchDescription(officialLogId, { description })
  await CultivationLogService.approve(officialLogId, { comment: 'Đạt yêu cầu' })
}
