import http from '../01_axios'
import {
  apiGetJournals,
  apiCreateJournal,
  apiImportJournals,
  apiExportMultipleJournals,
  apiGetJournalById,
  apiUpdateJournal,
  apiDeleteJournal,
  apiApproveJournal,
  apiLockJournal,
  apiExportJournalPdf,
  apiExportJournalQr,
  apiGetJournalByQr,
  apiGetHtxJournals,
  apiCreateHtxJournal,
  apiGetHtxFarmers,
} from './urls'

const getJournals = (params) => http.get(apiGetJournals, { params })
const createJournal = (body) => http.post(apiCreateJournal, body)
const importJournals = (body) => http.post(apiImportJournals, body)
const exportMultiple = (body) => http.post(apiExportMultipleJournals, body)
const getJournalById = (id) => http.get(apiGetJournalById(id))
const updateJournal = (id, body) => http.put(apiUpdateJournal(id), body)
const deleteJournal = (id) => http.delete(apiDeleteJournal(id))
const approveJournal = (id, body) => http.put(apiApproveJournal(id), body)
const lockJournal = (id, body) => http.put(apiLockJournal(id), body)
const exportPdf = (id) => http.get(apiExportJournalPdf(id), { responseType: 'blob' })
const exportQr = (id) => http.get(apiExportJournalQr(id), { responseType: 'blob' })
const getJournalByQr = (qrCode) => http.get(apiGetJournalByQr(qrCode))

// HTX
const getHtxJournals = (params) => http.get(apiGetHtxJournals, { params })
const createHtxJournal = (body) => http.post(apiCreateHtxJournal, body)
const getHtxFarmers = () => http.get(apiGetHtxFarmers)

const JournalService = {
  getJournals,
  createJournal,
  importJournals,
  exportMultiple,
  getJournalById,
  updateJournal,
  deleteJournal,
  approveJournal,
  lockJournal,
  exportPdf,
  exportQr,
  getJournalByQr,
  getHtxJournals,
  createHtxJournal,
  getHtxFarmers,
}

export default JournalService
