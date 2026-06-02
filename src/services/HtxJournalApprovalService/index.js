import http from '../01_axios'
import { apiGetHtxJournals, apiUpdateHtxFarmerStatus } from './urls'

const getHtxJournals = (params) => http.get(apiGetHtxJournals, { params })
const updateHtxFarmerStatus = (journalId, farmerId, body) =>
  http.put(apiUpdateHtxFarmerStatus(journalId, farmerId), body)

const HtxJournalApprovalService = {
  getHtxJournals,
  updateHtxFarmerStatus,
}

export default HtxJournalApprovalService
