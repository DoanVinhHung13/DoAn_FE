const ACTIVE_VALUES = new Set([
  'true',
  '1',
  'active',
  'status_active',
  'active_status',
]);

const INACTIVE_VALUES = new Set([
  'false',
  '0',
  'inactive',
  'status_inactive',
  'inactive_status',
  'disabled',
  'deleted',
  'ngừng hoạt động',
]);

const normalizeStatus = (value) => String(value).trim().toLowerCase();

export const isActiveCropCatalog = (catalog) => {
  const activeValue = catalog?.isActive ?? catalog?.IsActive;

  if (typeof activeValue === 'boolean') return activeValue;

  if (activeValue !== null && activeValue !== undefined) {
    const normalizedActiveValue = normalizeStatus(activeValue);
    if (ACTIVE_VALUES.has(normalizedActiveValue)) return true;
    if (INACTIVE_VALUES.has(normalizedActiveValue)) return false;
  }

  const status = catalog?.status ?? catalog?.Status;
  if (status === null || status === undefined) return false;

  return ACTIVE_VALUES.has(normalizeStatus(status));
};
