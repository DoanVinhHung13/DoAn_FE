// CultivationLogbooks API endpoints
export const apiGetCultivationLogbooks = '/cultivation-logbooks'
export const apiCreateCultivationLogbook = '/cultivation-logbooks'
export const apiGetCultivationLogbookById = (id) => `/cultivation-logbooks/${id}`
export const apiUpdateCultivationLogbook = (id) => `/cultivation-logbooks/${id}`
export const apiDeleteCultivationLogbook = (id) => `/cultivation-logbooks/${id}`

// Workflow endpoints
export const apiSubmitCompletion = (id) => `/cultivation-logbooks/${id}/submit-completion`
export const apiApproveCompletion = (id) => `/cultivation-logbooks/${id}/approve-completion`
export const apiRejectCompletion = (id) => `/cultivation-logbooks/${id}/reject-completion`
export const apiPlanLogbook = (id) => `/cultivation-logbooks/${id}/plan`
export const apiStartLogbook = (id) => `/cultivation-logbooks/${id}/start`
export const apiCompleteLogbook = (id) => `/cultivation-logbooks/${id}/complete`

// Manager bước 6 — danh sách chờ chốt sổ
// Swagger: GET /api/cultivation-logbooks/closing-reviews
export const apiGetClosingReviews = '/cultivation-logbooks/closing-reviews'
