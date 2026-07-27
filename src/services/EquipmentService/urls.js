const BASE_URL = '/equipment'

export const apiGetEquipment = BASE_URL
export const apiCreateEquipment = BASE_URL
export const apiGetEquipmentById = (id) => `${BASE_URL}/${id}`
export const apiUpdateEquipment = (id) => `${BASE_URL}/${id}`
export const apiDeleteEquipment = (id) => `${BASE_URL}/${id}`
