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

import CultivationStageService from 'src/services/CultivationStageService'

/** 
 * Load leader-summary (API của Leader: /cultivation-tasks/{id}/leader-summary)
 */
export const loadLeaderCompileData = async (taskId) => {
  const summaryRes = await CultivationTaskService.getLeaderSummary(taskId)
  const summary = unwrap(summaryRes) || null

  const leaderSubmittedDescription = summary?.description || summary?.leaderSubmittedDescription || ''
  
  // Resolve Cultivation Log ID từ Summary object
  const submittedLogId =
    summary?.cultivationLogId ||
    summary?.officialLogId ||
    summary?.submittedLogId ||
    summary?.logId ||
    summary?.id ||
    null

  const isApproved = summary?.status === 'COMPLETED' || summary?.status === 'APPROVED'

  return { summary, leaderSubmittedDescription, submittedLogId, isApproved }
}

/** 
 * Gọi API POST /api/cultivation-stages/{stageId}/official-logs
 * Body: { supervisorDescription: description }
 */
export const saveCompiledDescription = async (stageId, description) => {
  const targetStageId = typeof stageId === 'object' ? (stageId.stageId || stageId.id || stageId.cultivationStageId) : stageId
  const payload = {
    supervisorDescription: description,
  }
  return await CultivationStageService.createOfficialLogs(targetStageId, payload)
}
