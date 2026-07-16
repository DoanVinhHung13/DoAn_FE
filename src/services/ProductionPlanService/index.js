import http from '../01_axios'
import {
  apiGetProductionPlans,
  apiCreateProductionPlan,
  apiGetProductionPlanById,
  apiUpdateProductionPlan,
} from './urls'
import { getMockProductionPlans, getMockProductionPlanById } from './mockData'

// API production plans đã sẵn sàng.
const USE_MOCK = false

const getAll = (params) => {
  if (USE_MOCK) {
    return Promise.resolve(getMockProductionPlans(params))
  }
  return http.get(apiGetProductionPlans, { params })
}

const getById = (id) => {
  if (USE_MOCK) {
    return Promise.resolve(getMockProductionPlanById(id))
  }
  return http.get(apiGetProductionPlanById(id))
}

const create = (body, config) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, message: 'Tạo kế hoạch sản xuất thành công!' })
  }
  return http.post(apiCreateProductionPlan, body, config)
}

const update = (id, body, config) =>
  http.put(apiUpdateProductionPlan(id), body, config)

const ProductionPlanService = {
  getAll,
  getById,
  create,
  update,
}

export default ProductionPlanService
