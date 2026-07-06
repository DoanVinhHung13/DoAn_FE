// fertilizerService/urls.js
// Swagger: https://api.eapls.io.vn/swagger/index.html → nhóm "Fertilizers"
//
// GET    /api/fertilizers              → getList (PageIndex, PageSize, SearchKeyword, Type?, Status?)
// POST   /api/fertilizers              → create   { name, code, unit, supplier?, manufacturer?, materialId?, price?, description?, minimumStock?, type?, compositions?, dosages? }
// GET    /api/fertilizers/{id}         → getById
// PUT    /api/fertilizers/{id}         → update   { same as create + isActive? }
// DELETE /api/fertilizers/{id}         → soft-delete

export const apiGetFertilizers = '/fertilizers'
export const apiCreateFertilizer = '/fertilizers'
export const apiGetFertilizerById = (id) => `/fertilizers/${id}`
export const apiUpdateFertilizer = (id) => `/fertilizers/${id}`
export const apiDeleteFertilizer = (id) => `/fertilizers/${id}`
export const apiToggleFertilizerStatus = (id) => `/fertilizers/${id}`
