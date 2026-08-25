export const normalizeFertilizerType = value =>
  String(value ?? "")
    .trim()
    .toUpperCase()
