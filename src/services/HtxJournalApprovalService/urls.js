export const apiGetHtxJournals = '/htx/journals'
export const apiUpdateHtxFarmerStatus = (journalId, farmerId) =>
  `/htx/journals/${journalId}/farmers/${farmerId}/status`
