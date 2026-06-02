export const LOCATION_API = 'https://provinces.open-api.vn/api/v2';
export const apiGetProvinces = `${LOCATION_API}/p/`;
export const apiGetWardsByProvince = provinceCode => `${LOCATION_API}/p/${provinceCode}?depth=2`;
