import http from '../01_axios'
import {
  apiGetSchemas,
  apiCreateSchema,
  apiGetSchemaById,
  apiUpdateSchema,
  apiDeleteSchema,
} from './urls'

const getSchemas = (params) => http.get(apiGetSchemas, { params })
const createSchema = (body) => http.post(apiCreateSchema, body)
const getSchemaById = (id) => http.get(apiGetSchemaById(id))
const updateSchema = (id, body) => http.put(apiUpdateSchema(id), body)
const deleteSchema = (id) => http.delete(apiDeleteSchema(id))

const SchemaService = {
  getSchemas,
  createSchema,
  getSchemaById,
  updateSchema,
  deleteSchema,
}

export default SchemaService
