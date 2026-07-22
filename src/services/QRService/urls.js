// QR Service URLs
const BASE_URL = '/qr-codes';

export const apiGetQRCodes = BASE_URL;
export const apiGetQRCodeById = (id) => `${BASE_URL}/${id}`;
export const apiPreviewQRCode = `${BASE_URL}/preview`;
export const apiCreateQRCode = BASE_URL;
export const apiUpdateQRCode = (id) => `${BASE_URL}/${id}`;
export const apiDeleteQRCode = (id) => `${BASE_URL}/${id}`;
export const apiDownloadQRCode = (id) => `${BASE_URL}/${id}/download`;
export const apiGetQRStats = `${BASE_URL}/stats`;

