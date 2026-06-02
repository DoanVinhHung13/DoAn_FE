// Journal API endpoints
export const apiGetJournals = '/journals'
export const apiCreateJournal = '/journals'
export const apiImportJournals = '/journals/import'
export const apiExportMultipleJournals = '/journals/export-multiple'
export const apiGetJournalById = (id) => `/journals/${id}`
export const apiUpdateJournal = (id) => `/journals/${id}`
export const apiDeleteJournal = (id) => `/journals/${id}`
export const apiApproveJournal = (id) => `/journals/${id}/approve`
export const apiLockJournal = (id) => `/journals/${id}/lock`
export const apiExportJournalPdf = (id) => `/journals/${id}/export-pdf`
export const apiExportJournalQr = (id) => `/journals/${id}/export-qr`
export const apiGetJournalByQr = (qrCode) => `/journals/trace/${qrCode}`

// HTX Journal endpoints
export const apiGetHtxJournals = '/htx/journals'
export const apiCreateHtxJournal = '/htx/journals'
export const apiGetHtxFarmers = '/htx/journals/farmers'
