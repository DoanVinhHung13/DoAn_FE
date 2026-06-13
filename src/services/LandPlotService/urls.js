export const apiGetLandPlots = '/land-plots'
export const apiCreateLandPlot = '/land-plots'
export const apiGetLandPlotById = (id) => `/land-plots/${id}`
export const apiUpdateLandPlot = (id) => `/land-plots/${id}`
export const apiAssignLandManager = (id) => `/land-plots/${id}/managers`
export const apiRemoveLandManager = (id, landManagerId) =>
  `/land-plots/${id}/managers/${landManagerId}`
export const apiActivateLandPlot = (id) => `/land-plots/${id}/activate`
export const apiDeactivateLandPlot = (id) => `/land-plots/${id}/deactivate`
