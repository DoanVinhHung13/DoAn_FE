import http from '../01_axios'
import {
  apiCreateProductionStage,
  apiDeleteProductionStage,
  apiGetProductionStages,
  apiUpdateProductionStage,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetProductionStages, { params, skipNotice: true })

const create = (body) =>
  http.post(apiCreateProductionStage, body, silentConfig)

const update = (id, body) =>
  http.put(apiUpdateProductionStage(id), body, silentConfig)

const remove = (id) =>
  http.delete(apiDeleteProductionStage(id), silentConfig)

const ProductionStageService = {
  getAll,
  create,
  update,
  remove,
}

export default ProductionStageService
