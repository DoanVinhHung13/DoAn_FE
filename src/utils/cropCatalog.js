export const isActiveCropCatalog = (catalog) => {
  const activeValue = catalog?.isActive ?? catalog?.IsActive;

  if (typeof activeValue === 'boolean') return activeValue;
  if (typeof activeValue === 'string') return activeValue.trim().toLowerCase() === 'true';

  const status = catalog?.status ?? catalog?.Status;
  if (status == null) return false;

  return ['active', 'status_active'].includes(String(status).trim().toLowerCase());
};
