export const apiQualityInspections =
  '/cultivation-logs/quality-inspections'

export const apiQualityInspectionById = (id) =>
  `/cultivation-logs/quality-inspections/${id}`

export const apiSaveInspectionDraft = (id) =>
  `/cultivation-logs/${id}/save-inspection-draft`

export const apiApproveInspection = (id) =>
  `/cultivation-logs/${id}/approve`

export const apiRejectInspection = (id) =>
  `/cultivation-logs/${id}/reject`
