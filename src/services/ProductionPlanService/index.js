import http from '../01_axios'
import {
  apiGetProductionPlans,
  apiCreateProductionPlan,
  apiGetProductionPlanById,
} from './urls'
import { getMockProductionPlans, getMockProductionPlanById } from './mockData'

// Chế độ mock (bật khi API chưa sẵn sàng)
const USE_MOCK = true

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

const create = (body) => {
  if (USE_MOCK) {
    return Promise.resolve({ success: true, message: 'Tạo kế hoạch sản xuất thành công!' })
  }
  return http.post(apiCreateProductionPlan, body)
}

const ProductionPlanService = {
  getAll,
  getById,
  create,
}

export default ProductionPlanService
