import http from '../01_axios';
import {
  apiGetMaterials,
  apiGetMaterialById,
  apiCreateMaterial,
  apiUpdateMaterial,
  apiDeleteMaterial,
  apiActivateMaterial,
  apiDeactivateMaterial,
} from './urls';

export const getMaterials = (params) => http.get(apiGetMaterials, { params });
export const getMaterialById = (id) => http.get(apiGetMaterialById(id));
export const createMaterial = (data) => http.post(apiCreateMaterial, data);
export const updateMaterial = (id, data) => http.put(apiUpdateMaterial(id), data);
export const deleteMaterial = (id) => http.delete(apiDeleteMaterial(id));
export const activateMaterial = (id) => http.put(apiActivateMaterial(id));
export const deactivateMaterial = (id) => http.put(apiDeactivateMaterial(id));

const MaterialService = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  activateMaterial,
  deactivateMaterial,
};

export default MaterialService;
