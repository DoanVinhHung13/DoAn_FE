import http from '../01_axios'
import {
  apiGetPlanTemplates,
  apiCreatePlanTemplate,
  apiGetPlanTemplateById,
  apiUpdatePlanTemplate,
  apiDeletePlanTemplate,
} from './urls'
import { getMockPlanTemplates, getMockPlanTemplateById } from './mockData'

// Chế độ mock (bật khi API chưa sẵn sàng)
const USE_MOCK = true

const getAll = (params) => {
  if (USE_MOCK) {
    return Promise.resolve(getMockPlanTemplates(params))
  }
  return http.get(apiGetPlanTemplates, { params })
}

const getById = (id) => {
  if (USE_MOCK) {
    return Promise.resolve(getMockPlanTemplateById(id))
  }
  return http.get(apiGetPlanTemplateById(id))
}

const create = (body) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, message: 'Tạo mẫu thành công!' })
  }
  return http.post(apiCreatePlanTemplate, body)
}

const update = (id, body) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, message: 'Cập nhật mẫu thành công!' })
  }
  return http.put(apiUpdatePlanTemplate(id), body)
}

const remove = (id) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, message: 'Xóa mẫu thành công!' })
  }
  return http.delete(apiDeletePlanTemplate(id))
}

const PlanTemplateService = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default PlanTemplateService
