import http from '../01_axios'
import {
  apiGetProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiRegisterProductPortal,
  apiGetSchemas,
} from './urls'

const getProducts = (params) => http.get(apiGetProducts, { params })
const createProduct = (body) => http.post(apiCreateProduct, body)
const updateProduct = (id, body) => http.put(apiUpdateProduct(id), body)
const registerProductPortal = (id) => http.post(apiRegisterProductPortal(id))
const getSchemas = (params) => http.get(apiGetSchemas, { params })

const HtxProductService = {
  getProducts,
  createProduct,
  updateProduct,
  registerProductPortal,
  getSchemas,
}

export default HtxProductService
