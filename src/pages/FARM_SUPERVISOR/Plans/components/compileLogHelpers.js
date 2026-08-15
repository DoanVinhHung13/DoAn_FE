/**
 * Shared helpers for Supervisor biên soạn nhật ký từ leader-summary.
 */
import CultivationTaskService from 'src/services/CultivationTaskService'
import { formatAreaUnit } from 'src/constants/measurementUnits'

export const unwrap = (res) => res?.data?.data ?? res?.data ?? res

export const buildDataSentence = (summary) => {
  if (!summary) return 'Chưa có số liệu'
  const parts = []

  const harvestQuantity = summary.totalHarvestQuantity
  const harvestArea = Number(summary.totalHarvestedArea || 0)
  if (harvestQuantity != null || harvestArea > 0) {
    const quantityPart = harvestQuantity != null
      ? `${harvestQuantity} ${summary.harvestUnit || 'kg'}`
      : ''
    const areaPart = harvestArea > 0 ? ` trên diện tích ${harvestArea} m²` : ''
    parts.push(`Đã thu hoạch ${quantityPart}${areaPart}`.trim())
  }

  if (Array.isArray(summary.materials) && summary.materials.length > 0) {
    summary.materials.forEach((m) => {
      const qty = m.quantity ?? m.totalQuantity ?? 0
      const unit = m.unit ?? m.quantityUnit ?? ''
      const typeStr = m.type ? ` (${m.type})` : ''
      const areaStr = (m.totalArea != null && m.totalArea > 0) ? ` cho ${m.totalArea} ${formatAreaUnit(m.areaUnit)}` : ''
      parts.push(`Đã dùng ${qty} ${unit} ${m.name}${typeStr}${areaStr}`.trim())
    })
  } else {
    ;(summary.fertilizers || []).forEach((f) => {
      parts.push(
        `Đã bón ${f.totalQuantity ?? f.quantity} ${f.quantityUnit ?? f.unit} ${f.name}` +
          (f.totalArea != null ? ` cho ${f.totalArea} ${formatAreaUnit(f.areaUnit)}` : '')
      )
    })
    ;(summary.pesticides || []).forEach((p) => {
      parts.push(
        `Đã phun ${p.totalQuantity ?? p.quantity} ${p.quantityUnit ?? p.unit} ${p.name}` +
          (p.totalArea != null ? ` cho ${p.totalArea} ${formatAreaUnit(p.areaUnit)}` : '')
      )
    })
  }
  return parts.length ? parts.join('. ') : 'Không có số liệu vật tư'
}

import CultivationStageService from 'src/services/CultivationStageService'

/** 
 * Load leader-summary (API của Leader: /cultivation-tasks/{id}/leader-summary)
 */
export const loadLeaderCompileData = async (taskId) => {
  const summaryRes = await CultivationTaskService.getLeaderSummary(taskId)
  const summary = unwrap(summaryRes) || null

  const leaderSubmittedDescription =
    summary?.leaderSubmittedDescription ||
    summary?.descriptionSummary ||
    summary?.description ||
    summary?.draftDescription ||
    ''
  
  // Resolve Cultivation Log ID từ Summary object
  const submittedLogId =
    summary?.submittedLogId ||
    summary?.cultivationLogId ||
    summary?.officialLogId ||
    summary?.logId ||
    summary?.id ||
    null

  const isApproved = summary?.status === 'COMPLETED' || summary?.status === 'APPROVED'

  return { summary, leaderSubmittedDescription, submittedLogId, isApproved }
}

/** 
 * Gọi API POST /api/cultivation-stages/{stageId}/official-logs
 * Body: { cultivationTaskId, supervisorDescription: description }
 */
export const saveCompiledDescription = async (stageId, taskId, description) => {
  const targetStageId = typeof stageId === 'object' ? (stageId.stageId || stageId.id || stageId.cultivationStageId) : stageId
  const payload = {
    cultivationTaskId: taskId,
    supervisorDescription: description,
  }
  return await CultivationStageService.createOfficialLogs(targetStageId, payload)
}
