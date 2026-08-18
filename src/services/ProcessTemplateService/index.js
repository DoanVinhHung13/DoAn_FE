import http from "../01_axios"
import {
  apiGetProcessTemplates,
  apiCreateProcessTemplate,
  apiGetProcessTemplateById,
  apiUpdateProcessTemplate,
  apiDeleteProcessTemplate,
} from "./urls"
const getProcessTemplates = params =>
  http.get(apiGetProcessTemplates, { params, skipNotice: true })

const getProcessTemplateById = id =>
  http.get(apiGetProcessTemplateById(id), { skipNotice: true })

const createProcessTemplate = (body, config) =>
  http.post(apiCreateProcessTemplate, body, config)

const updateProcessTemplate = (id, body, config) =>
  http.put(apiUpdateProcessTemplate(id), body, config)

const deleteProcessTemplate = id => http.delete(apiDeleteProcessTemplate(id))

const ProcessTemplateService = {
  getProcessTemplates,
  getProcessTemplateById,
  createProcessTemplate,
  updateProcessTemplate,
  deleteProcessTemplate,
}

export default ProcessTemplateService
