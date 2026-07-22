export const apiGetLandPlots = '/land-plots'
export const apiCreateLandPlot = '/land-plots'
export const apiGetLandPlotById = (id) => `/land-plots/${id}`
export const apiUpdateLandPlot = (id) => `/land-plots/${id}`

export const apiActivateLandPlot = (id) => `/land-plots/${id}/activate`
export const apiDeactivateLandPlot = (id) => `/land-plots/${id}/deactivate`

// Swagger: GET /api/land-plots/available-for-logbook
export const apiGetLandPlotsAvailableForLogbook = '/land-plots/available-for-logbook'
