import http from '../01_axios'
import {
  apiCreateProcessStep,
  apiDeleteProcessStep,
  apiGetProcessStepById,
  apiGetProcessSteps,
  apiUpdateProcessStep,
} from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) =>
  http.get(apiGetProcessSteps, { params, skipNotice: true })

const getById = (id) =>
  http.get(apiGetProcessStepById(id), silentConfig)

const create = (body) =>
  http.post(apiCreateProcessStep, body, silentConfig)

const update = (id, body) =>
  http.put(apiUpdateProcessStep(id), body, silentConfig)

const remove = (id) =>
  http.delete(apiDeleteProcessStep(id), silentConfig)

const ProcessStepService = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default ProcessStepService
