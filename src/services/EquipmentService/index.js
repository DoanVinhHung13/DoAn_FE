import http from '../01_axios'
import {
  apiCreateEquipment,
  apiDeleteEquipment,
  apiGetEquipment,
  apiGetEquipmentById,
  apiUpdateEquipment,
} from './urls'

const getAll = (params) => http.get(apiGetEquipment, { params })
const getById = (id) => http.get(apiGetEquipmentById(id))
const create = (body) => http.post(apiCreateEquipment, body)
const update = (id, body) => http.put(apiUpdateEquipment(id), body)
const remove = (id) => http.delete(apiDeleteEquipment(id))

export default { getAll, getById, create, update, remove }
