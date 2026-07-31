import http from '../01_axios';
import {
  apiActivateCropCatalog,
  apiCreateCropCatalog,
  apiDeactivateCropCatalog,
  apiGetCropCatalogById,
  apiGetCropCatalogs,
  apiUpdateCropCatalog,
} from './urls';

const getCropCatalogs = (params) => http.get(apiGetCropCatalogs, { params });
const getCropCatalogById = (id, config) => http.get(apiGetCropCatalogById(id), config);
const createCropCatalog = (body, config) => http.post(apiCreateCropCatalog, body, config);
const updateCropCatalog = (id, body, config) => http.put(apiUpdateCropCatalog(id), body, config);
const activateCropCatalog = (id) => http.post(apiActivateCropCatalog(id));
const deactivateCropCatalog = (id) => http.post(apiDeactivateCropCatalog(id));

const CropCatalogService = {
  getCropCatalogs,
  getCropCatalogById,
  createCropCatalog,
  updateCropCatalog,
  activateCropCatalog,
  deactivateCropCatalog,
};

export default CropCatalogService;
