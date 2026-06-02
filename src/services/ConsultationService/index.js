import http from '../01_axios'
import {
  apiGetConsultations,
  apiCreateConsultation,
  apiGetConsultationById,
  apiUpdateConsultation,
  apiDeleteConsultation,
} from './urls'

const getConsultations = (params) => http.get(apiGetConsultations, { params })
const createConsultation = (body) => http.post(apiCreateConsultation, body)
const getConsultationById = (id) => http.get(apiGetConsultationById(id))
const updateConsultation = (id, body) => http.put(apiUpdateConsultation(id), body)
const deleteConsultation = (id) => http.delete(apiDeleteConsultation(id))

const ConsultationService = {
  getConsultations,
  createConsultation,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
}

export default ConsultationService
