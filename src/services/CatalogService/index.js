import http from '../01_axios'
import { apiGetCatalogFertilizers, apiGetCatalogPesticides } from './urls'

const getCatalogFertilizers = (params) => http.get(apiGetCatalogFertilizers, { params })
const getCatalogPesticides = (params) => http.get(apiGetCatalogPesticides, { params })

const CatalogService = {
  getCatalogFertilizers,
  getCatalogPesticides,
}

export default CatalogService
