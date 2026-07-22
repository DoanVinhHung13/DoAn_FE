/**
 * ProductService — chọn sản phẩm khi tạo harvest-batch (bước 6)
 * Không dựng màn CRUD Products (luồng phụ).
 */
import http from '../01_axios'
import { apiGetProducts, apiGetProductById } from './urls'

const silentConfig = { skipNotice: true }

const getAll = (params) => http.get(apiGetProducts, { params, ...silentConfig })

const getById = (id) => http.get(apiGetProductById(id), silentConfig)

const ProductService = {
  getAll,
  getById,
}

export default ProductService
