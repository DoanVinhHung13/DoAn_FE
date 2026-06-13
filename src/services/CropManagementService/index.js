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
const getCropById = (id) => http.get(apiGetCropById(id));
const createCrop = (body) => http.post(apiCreateCrop, body);
const updateCrop = (id, body) => http.put(apiUpdateCrop(id), body);
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
