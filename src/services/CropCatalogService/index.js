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
const getCropCatalogById = (id) => http.get(apiGetCropCatalogById(id));
const createCropCatalog = (body) => http.post(apiCreateCropCatalog, body);
const updateCropCatalog = (id, body) => http.put(apiUpdateCropCatalog(id), body);
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
