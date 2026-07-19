// CultivationLogs API endpoints
export const apiGetCultivationLogs = '/cultivation-logs'
export const apiCreateCultivationLog = '/cultivation-logs'
export const apiGetCultivationLogById = (id) => `/cultivation-logs/${id}`
export const apiUpdateCultivationLog = (id) => `/cultivation-logs/${id}`
export const apiDeleteCultivationLog = (id) => `/cultivation-logs/${id}`

// Approval endpoints
export const apiApproveCultivationLog = (id) => `/cultivation-logs/${id}/approve`
export const apiRejectCultivationLog = (id) => `/cultivation-logs/${id}/reject`
export const apiSaveInspectionDraft = (id) => `/cultivation-logs/${id}/save-inspection-draft`

// Get logs by logbook or land plot
export const apiGetLogbookLogs = (id) => `/cultivation-logbooks/${id}/logs`
export const apiGetLandPlotLogs = (id) => `/land-plots/${id}/logs`

// Quality inspections
export const apiGetQualityInspections = '/cultivation-logs/quality-inspections'
export const apiGetQualityInspectionById = (id) => `/cultivation-logs/quality-inspections/${id}`

// Upload images
export const apiUploadLogImages = (id) => `/cultivation-logs/${id}/images`
