export const MEASUREMENT_UNITS = Object.freeze({
  LITER: 'lít',
  KILOGRAM: 'kg',
  SQUARE_METER: 'm2',
})

export const getQuantityUnit = (unit, fallback = MEASUREMENT_UNITS.KILOGRAM) =>
  unit === MEASUREMENT_UNITS.LITER || unit === MEASUREMENT_UNITS.KILOGRAM
    ? unit
    : fallback
