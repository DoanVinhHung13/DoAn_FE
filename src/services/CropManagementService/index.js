import http from '../01_axios';
import {
  apiActivateCrop,
  apiCreateCrop,
  apiDeactivateCrop,
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

const CropManagementService = {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  activateCrop,
  deactivateCrop,
};

export default CropManagementService;
