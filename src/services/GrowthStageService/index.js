import http from '../01_axios';
import {
  apiCreateGrowthStage,
  apiDeleteGrowthStage,
  apiGetGrowthStageById,
  apiGetGrowthStages,
  apiUpdateGrowthStage,
} from './urls';

const getGrowthStages = (params) => http.get(apiGetGrowthStages, { params });
const getGrowthStageById = (id) => http.get(apiGetGrowthStageById(id));
const createGrowthStage = (body) => http.post(apiCreateGrowthStage, body);
const updateGrowthStage = (id, body) => http.put(apiUpdateGrowthStage(id), body);
const deleteGrowthStage = (id) => http.delete(apiDeleteGrowthStage(id));

const GrowthStageService = {
  getGrowthStages,
  getGrowthStageById,
  createGrowthStage,
  updateGrowthStage,
  deleteGrowthStage,
};

export default GrowthStageService;
