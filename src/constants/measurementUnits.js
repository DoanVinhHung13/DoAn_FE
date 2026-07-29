export const MEASUREMENT_UNITS = Object.freeze({
  LITER: 'lít',
  KILOGRAM: 'kg',
  SQUARE_METER: 'm2',
})

export const getQuantityUnit = (unit, fallback = MEASUREMENT_UNITS.KILOGRAM) => {
  const normalizedUnit = typeof unit === 'string' ? unit.trim() : ''

  return normalizedUnit || fallback
}
