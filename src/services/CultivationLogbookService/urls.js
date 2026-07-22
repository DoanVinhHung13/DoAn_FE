// CultivationLogbooks API endpoints
export const apiGetCultivationLogbooks = '/cultivation-logbooks'
export const apiCreateCultivationLogbook = '/cultivation-logbooks'
export const apiGetCultivationLogbookById = (id) => `/cultivation-logbooks/${id}`
export const apiUpdateCultivationLogbook = (id) => `/cultivation-logbooks/${id}`
export const apiDeleteCultivationLogbook = (id) => `/cultivation-logbooks/${id}`

// Workflow endpoints
export const apiSubmitReview = (id) => `/cultivation-logbooks/${id}/submit-review`
export const apiApproveReview = (id) => `/cultivation-logbooks/${id}/approve-review`
export const apiRejectReview = (id) => `/cultivation-logbooks/${id}/reject-review`
export const apiSubmitCompletion = (id) => `/cultivation-logbooks/${id}/submit-completion`
export const apiApproveCompletion = (id) => `/cultivation-logbooks/${id}/approve-completion`
export const apiRejectCompletion = (id) => `/cultivation-logbooks/${id}/reject-completion`
export const apiPlanLogbook = (id) => `/cultivation-logbooks/${id}/plan`
export const apiStartLogbook = (id) => `/cultivation-logbooks/${id}/start`
export const apiCompleteLogbook = (id) => `/cultivation-logbooks/${id}/complete`
export const apiCancelLogbook = (id) => `/cultivation-logbooks/${id}/cancel`

// Manager bước 6 — danh sách chờ chốt sổ
// Swagger: GET /api/cultivation-logbooks/closing-reviews
export const apiGetClosingReviews = '/cultivation-logbooks/closing-reviews'
