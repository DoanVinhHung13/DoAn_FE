import React from "react"
import {
  AreaChartOutlined,
  BarChartOutlined,
  ExperimentOutlined,
} from "@ant-design/icons"
import { formatAreaUnit } from "src/constants/measurementUnits"

export const REPORT_TYPES = {
  HARVEST: "harvest",
  AREA: "area",
  MATERIAL: "material",
}

export const REPORT_API_NAMES = {
  [REPORT_TYPES.HARVEST]: "harvest-yield",
  [REPORT_TYPES.AREA]: "cultivated-area",
  [REPORT_TYPES.MATERIAL]: "material-usage",
}

export const REPORT_META = {
  [REPORT_TYPES.HARVEST]: {
    label: "Tổng thu hoạch",
    description: "Theo dõi sản lượng thu hoạch trong khoảng thời gian đã chọn.",
    icon: <BarChartOutlined />,
  },
  [REPORT_TYPES.AREA]: {
    label: "Diện tích canh tác",
    description: "Tra cứu diện tích canh tác theo cây trồng và thời gian.",
    icon: <AreaChartOutlined />,
  },
  [REPORT_TYPES.MATERIAL]: {
    label: "Sử dụng vật tư",
    description: "Tổng hợp khối lượng vật tư đã sử dụng trong kỳ báo cáo.",
    icon: <ExperimentOutlined />,
  },
}

export const getPayload = response => {
  const body = response?.data ?? response ?? {}
  return body?.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data)
    ? body.data
    : body
}

export const getRows = response => {
  const payload = getPayload(response)
  if (Array.isArray(payload)) return payload

  const rowKeys = ["rows", "Rows", "items", "Items", "results", "Results"]
  for (const key of rowKeys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }

  return Array.isArray(payload?.data) ? payload.data : []
}

export const readField = (source, keys) => {
  const candidates = [
    source,
    source?.summary,
    source?.Summary,
    source?.totals,
    source?.Totals,
  ]
  for (const candidate of candidates) {
    for (const key of keys) {
      if (
        candidate?.[key] !== undefined &&
        candidate?.[key] !== null &&
        candidate?.[key] !== ""
      ) {
        return candidate[key]
      }
    }
  }
  return null
}

export const toNumber = value => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (value === null || value === undefined || value === "") return null

  const textValue = String(value).trim().replace(/\s/g, "")
  const normalized = textValue.includes(",")
    ? textValue.replace(/\./g, "").replace(",", ".")
    : textValue
  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export const getRowNumber = (row, keys) => toNumber(readField(row, keys))

export const sumValues = (rows, keys) =>
  rows.reduce((total, row) => total + (getRowNumber(row, keys) ?? 0), 0)

export const formatNumber = value =>
  Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 3 })

export const formatUnitValue = (value, unit) =>
  `${formatNumber(value)} ${unit || ""}`.trim()

export const normalizeHarvestReport = response => {
  const payload = getPayload(response)
  const sourceRows = getRows(response)
  const valueKeys = [
    "QuantityHarvested",
    "quantityHarvested",
    "TotalYield",
    "totalYield",
    "Yield",
    "yield",
    "Quantity",
    "quantity",
    "Production",
    "production",
  ]
  const rows = sourceRows.map((row, index) => ({
    key: `harvest-${index}`,
    cropName:
      readField(row, [
        "CropName",
        "cropName",
        "Crop",
        "crop",
        "Name",
        "name",
      ]) || "Chưa phân loại",
    value: getRowNumber(row, valueKeys) ?? 0,
    unit:
      readField(row, [
        "Unit",
        "unit",
        "YieldUnit",
        "yieldUnit",
        "QuantityUnit",
        "quantityUnit",
      ]) || "kg",
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))
  const unit =
    readField(payload, [
      "Unit",
      "unit",
      "YieldUnit",
      "yieldUnit",
      "QuantityUnit",
      "quantityUnit",
    ]) ||
    rows[0]?.unit ||
    "kg"
  const total = payloadTotal ?? sumValues(rows, ["value"])
  const batchCount =
    toNumber(
      readField(payload, [
        "BatchCount",
        "batchCount",
        "TotalBatches",
        "totalBatches",
      ]),
    ) ?? rows.length

  if (!rows.length && payloadTotal !== null) {
    rows.push({
      key: "harvest-summary",
      cropName: "Tổng cộng",
      value: payloadTotal,
      unit,
    })
  }

  return { rows, total, unit, batchCount }
}

export const normalizeAreaReport = (response, selectedCropLabel) => {
  const payload = getPayload(response)
  const sourceRows = getRows(response)
  const valueKeys = [
    "CultivatedArea",
    "cultivatedArea",
    "TotalArea",
    "totalArea",
    "AreaM2",
    "areaM2",
    "Area",
    "area",
  ]
  const rows = sourceRows.map((row, index) => ({
    key: `area-${index}`,
    cropName:
      readField(row, [
        "CropName",
        "cropName",
        "Crop",
        "crop",
        "Name",
        "name",
      ]) ||
      selectedCropLabel ||
      "Chưa phân loại",
    value: getRowNumber(row, valueKeys) ?? 0,
    unit: formatAreaUnit(
      readField(row, ["AreaUnit", "areaUnit", "Unit", "unit"]),
    ),
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))
  const unit = formatAreaUnit(
    readField(payload, ["AreaUnit", "areaUnit", "Unit", "unit"]) ||
      rows[0]?.unit,
  )
  const total = payloadTotal ?? sumValues(rows, ["value"])

  if (!rows.length && payloadTotal !== null) {
    rows.push({
      key: "area-summary",
      cropName: selectedCropLabel || "Tổng cộng",
      value: payloadTotal,
      unit,
    })
  }

  return {
    rows,
    total,
    unit,
    cropName:
      selectedCropLabel ||
      readField(payload, ["CropName", "cropName", "Crop", "crop"]) ||
      "Tất cả cây trồng",
  }
}

export const normalizeMaterialReport = response => {
  const payload = getPayload(response)
  const valueKeys = [
    "QuantityUsed",
    "quantityUsed",
    "TotalQuantity",
    "totalQuantity",
    "Quantity",
    "quantity",
  ]
  const rows = getRows(response).map((row, index) => ({
    key: `material-${index}`,
    name:
      readField(row, [
        "Material",
        "material",
        "MaterialName",
        "materialName",
        "Name",
        "name",
      ]) || "Vật tư",
    unit:
      readField(row, ["Unit", "unit", "QuantityUnit", "quantityUnit"]) || "—",
    totalQuantity: getRowNumber(row, valueKeys) ?? 0,
  }))
  const payloadTotal = toNumber(readField(payload, valueKeys))

  return {
    rows,
    total: payloadTotal ?? sumValues(rows, ["totalQuantity"]),
  }
}
