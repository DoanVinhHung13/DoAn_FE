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
 * và stage summary (API của Supervisor: /api/cultivation-stages/{id}/summary)
 * để resolve leaderSubmittedDescription & submittedLogId.
 */
export const loadLeaderCompileData = async (taskId, stageId) => {
  const promises = [
    CultivationTaskService.getLeaderSummary(taskId),
    CultivationTaskService.getById(taskId),
  ]
  if (stageId) {
    promises.push(CultivationStageService.getSummary(stageId).catch(() => null))
  }

  const [summaryRes, taskRes, stageSummaryRes] = await Promise.all(promises)
  const summary = unwrap(summaryRes) || null
  const taskDetail = unwrap(taskRes) || null
  const stageSummary = unwrap(stageSummaryRes) || null

  let leaderSubmittedDescription = summary?.description || ''
  let submittedLogId = summary?.submittedLogId || summary?.cultivationLogId || taskDetail?.cultivationLogId || null

  if (stageSummary?.taskSummaries?.length) {
    const taskSummaryItem = stageSummary.taskSummaries.find(
      (ts) => ts.taskId === taskId || ts.id === taskId
    )
    if (taskSummaryItem) {
      if (taskSummaryItem.leaderSubmittedDescription) {
        leaderSubmittedDescription = taskSummaryItem.leaderSubmittedDescription
      }
      if ('submittedLogId' in taskSummaryItem) {
        submittedLogId = taskSummaryItem.submittedLogId
      }
    }
  }

  const isApproved = taskDetail?.status === 'COMPLETED'
  return { summary, taskDetail, leaderSubmittedDescription, submittedLogId, isApproved }
}

/** Gọi API approve với payload modifiedDescription do Supervisor biên tập. */
export const saveCompiledDescription = async (officialLogId, description) => {
  return await CultivationLogService.approve(officialLogId, { modifiedDescription: description })
}
