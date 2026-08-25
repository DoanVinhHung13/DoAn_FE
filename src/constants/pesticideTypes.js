export const normalizePesticideType = value =>
  String(value ?? "")
    .trim()
    .toUpperCase()
