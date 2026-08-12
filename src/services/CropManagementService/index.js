import http from '../01_axios';
import {
  apiActivateCrop,
  apiCreateCrop,
  apiDeactivateCrop,
  apiReactivateCrop,
  apiDeleteCrop,
  apiGetCropById,
  apiGetCrops,
  apiUpdateCrop,
} from './urls';

const getCrops = (params) => http.get(apiGetCrops, { params });
const getCropById = (id, config) => http.get(apiGetCropById(id), config);
const createCrop = (body, config) => http.post(apiCreateCrop, body, config);
const updateCrop = (id, body, config) => http.put(apiUpdateCrop(id), body, config);
const activateCrop = (id) => http.post(apiActivateCrop(id));
const deactivateCrop = (id) => http.post(apiDeactivateCrop(id));
const reactivateCrop = (id) => http.post(apiReactivateCrop(id));
const deleteCrop = (id) => http.delete(apiDeleteCrop(id));

const CropManagementService = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  activateCrop,
  deactivateCrop,
  reactivateCrop,
  deleteCrop,
};

export default CropManagementService;
