import http from '../01_axios'
import {
  apiGetInventory,
  apiCreateInventory,
  apiAddInventory,
  apiConsumeInventory,
  apiDistributeInventory,
  apiCreateTransaction,
  apiGetTransactions,
  apiGetInventoryById,
  apiUpdateInventory,
  apiDeleteInventory,
  apiGetInventoryCategories,
  apiCreateInventoryCategory,
  apiUpdateInventoryCategory,
  apiDeleteInventoryCategory,
} from './urls'

const getInventory = (params) => http.get(apiGetInventory, { params })
const createInventory = (body) => http.post(apiCreateInventory, body)
const addStock = (body) => http.post(apiAddInventory, body)
const consumeStock = (body) => http.post(apiConsumeInventory, body)
const distributeStock = (body) => http.post(apiDistributeInventory, body)
const createTransaction = (body) => http.post(apiCreateTransaction, body)
const getTransactions = (params) => http.get(apiGetTransactions, { params })
const getInventoryById = (id) => http.get(apiGetInventoryById(id))
const updateInventory = (id, body) => http.put(apiUpdateInventory(id), body)
const deleteInventory = (id) => http.delete(apiDeleteInventory(id))

// Categories
const getCategories = (params) => http.get(apiGetInventoryCategories, { params })
const createCategory = (body) => http.post(apiCreateInventoryCategory, body)
const updateCategory = (id, body) => http.put(apiUpdateInventoryCategory(id), body)
const deleteCategory = (id) => http.delete(apiDeleteInventoryCategory(id))

const InventoryService = {
  getInventory,
  createInventory,
  addStock,
  consumeStock,
  distributeStock,
  createTransaction,
  getTransactions,
  getInventoryById,
  updateInventory,
  deleteInventory,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}

export default InventoryService
