// Inventory API endpoints
export const apiGetInventory = "/inventory"
export const apiCreateInventory = "/inventory"
export const apiAddInventory = "/inventory/import"
export const apiConsumeInventory = "/inventory/consume"
export const apiDistributeInventory = "/inventory/distribute"
export const apiCreateTransaction = "/inventory/transaction"
export const apiGetTransactions = "/inventory/transactions"
export const apiGetImportHistory = "/inventory/import-history"
export const apiGetImportHistoryById = id => `/inventory/import-history/${id}`
export const apiGetInventoryById = id => `/inventory/${id}`
export const apiUpdateInventory = id => `/inventory/${id}`
export const apiDeleteInventory = id => `/inventory/${id}`

// Inventory Category endpoints
export const apiGetInventoryCategories = "/inventory-categories"
export const apiCreateInventoryCategory = "/inventory-categories"
export const apiUpdateInventoryCategory = id => `/inventory-categories/${id}`
export const apiDeleteInventoryCategory = id => `/inventory-categories/${id}`
