import http from '../01_axios'
import {
  apiGetPlanTemplates,
  apiCreatePlanTemplate,
  apiGetPlanTemplateById,
  apiUpdatePlanTemplate,
  apiDeletePlanTemplate,
} from './urls'
const getAll = (params) =>
  http.get(apiGetPlanTemplates, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiGetPlanTemplateById(id), { skipNotice: true })

const create = (body, config) =>
  http.post(apiCreatePlanTemplate, body, config)

const update = (id, body, config) =>
  http.put(apiUpdatePlanTemplate(id), body, config)

const remove = (id) =>
  http.delete(apiDeletePlanTemplate(id))

const PlanTemplateService = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default PlanTemplateService
