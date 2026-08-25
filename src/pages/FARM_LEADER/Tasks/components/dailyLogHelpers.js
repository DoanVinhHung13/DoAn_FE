import {
  formatAreaUnit,
  getQuantityUnit,
  MEASUREMENT_UNITS,
} from "src/constants/measurementUnits"
import {
  CULTIVATION_TASK_TYPES,
  normalizeCultivationTaskType,
} from "src/constants/cultivationTask"

export const HARVEST_UNIT = MEASUREMENT_UNITS.KILOGRAM
export const MAX_UPLOAD_FILES = 10
export const MAX_UPLOAD_TOTAL_BYTES = 100 * 1024 * 1024
export const MAX_UPLOAD_IMAGE_BYTES = 5 * 1024 * 1024

export const DAILY_LOG_FIELD_MAPPING = {
  Date: "date",
  date: "date",
  Description: "description",
  description: "description",
}

export const unwrap = res => res?.data?.data ?? res?.data ?? res

export const getMaterialUnit = item =>
  getQuantityUnit(
    item?.unit || item?.quantityUnit || item?.unitName || item?.materialUnit,
    "",
  )

export const toFiniteNumber = value => {
  if (value === null || value === undefined || value === "") return null

  const normalizedValue =
    typeof value === "string" ? value.replace(",", ".").trim() : value
  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : null
}

export const getHarvestQuantity = log =>
  toFiniteNumber(
    log?.harvestQuantity ??
      log?.quantityHarvested ??
      log?.harvestedQuantity ??
      log?.HarvestQuantity,
  )

export const isHarvestTaskData = task =>
  String(task?.taskType || "")
    .trim()
    .toUpperCase() === "HARVEST"

export const isMaterialTaskData = task =>
  normalizeCultivationTaskType(task?.taskType) ===
  CULTIVATION_TASK_TYPES.MATERIAL

export const toFertilizerOptions = list =>
  (list || []).map(item => {
    const unit = getMaterialUnit(item)
    return {
      value: item.id,
      label: unit ? `${item.name} (${unit})` : item.name,
      materialId: item.materialId || item.id,
      name: item.name,
      unit: unit,
      raw: item,
    }
  })

export const toPesticideOptions = list =>
  (list || []).map(item => {
    const unit = getMaterialUnit(item)
    return {
      value: item.id,
      label: unit ? `${item.name} (${unit})` : item.name,
      materialId: item.materialId || item.id,
      name: item.name,
      unit: unit,
      raw: item,
    }
  })

export const normalizeCropName = value =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

export const hasDosageForCrop = (targets, cropName) => {
  const normalizedCropName = normalizeCropName(cropName)
  if (!normalizedCropName) return false

  return (targets || []).some(target => {
    const value = target?.target ?? target?.targetCrop
    return normalizeCropName(value) === normalizedCropName
  })
}
