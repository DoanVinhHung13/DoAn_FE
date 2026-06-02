import axios from 'axios';
import { apiGetProvinces, apiGetWardsByProvince } from './urls';

const cache = {};
const cached = async (key, fetcher) => {
  if (cache[key]) return cache[key];
  cache[key] = await fetcher();
  return cache[key];
};

export const getProvinces = () =>
  cached('provinces', async () => {
    try {
      const { data } = await axios.get(apiGetProvinces);
      return (data || []).map(p => ({
        code: p.code,
        name: p.name,
        fullName: p.full_name || p.name,
      }));
    } catch {
      return [];
    }
  });

export const getWardsByProvince = provinceCode => {
  if (!provinceCode) return Promise.resolve([]);
  return cached(`wards_${provinceCode}`, async () => {
    try {
      const { data } = await axios.get(apiGetWardsByProvince(provinceCode));
      return (data?.wards || []).map(w => ({
        code: w.code,
        name: w.name,
        fullName: w.full_name || w.name,
        divisionType: w.division_type,
      }));
    } catch {
      return [];
    }
  });
};

export const getDistrictsByProvince = () => Promise.resolve([]);
export const getWardsByDistrict = () => Promise.resolve([]);
export const checkMergeWarning = () => null;

const LocationService = {
  getProvinces,
  getWardsByProvince,
  getDistrictsByProvince,
  getWardsByDistrict,
  checkMergeWarning,
};

export default LocationService;
