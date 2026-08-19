export const CULTIVATION_TASK_TYPES = {
  MATERIAL: "MATERIAL",
  HARVEST: "HARVEST",
  NON_MATERIAL: "NON_MATERIAL",
}

export const CULTIVATION_TASK_TYPE_LABELS = {
  MATERIAL: "Vật tư",
  HARVEST: "Thu hoạch",
  NON_MATERIAL: "Không vật tư",
}

export const CULTIVATION_TASK_TYPE_COLORS = {
  MATERIAL: "cyan",
  HARVEST: "purple",
  NON_MATERIAL: "default",
}

export const CULTIVATION_TASK_TYPE_OPTIONS = Object.entries(
  CULTIVATION_TASK_TYPES,
).map(([key, value]) => ({
  value,
  label: CULTIVATION_TASK_TYPE_LABELS[key],
}))

export const normalizeCultivationTaskType = value => {
  const normalized = String(value || "").toUpperCase()
  return Object.values(CULTIVATION_TASK_TYPES).includes(normalized)
    ? normalized
    : null
}

export const getCultivationTaskTypeLabel = value =>
  CULTIVATION_TASK_TYPE_LABELS[normalizeCultivationTaskType(value)] || "—"

export const getCultivationTaskTypeColor = value =>
  CULTIVATION_TASK_TYPE_COLORS[normalizeCultivationTaskType(value)] || "default"

export const toTaskApiDateTime = value => {
  if (!value) return null
  if (typeof value?.toISOString === "function") return value.toISOString()
  return value
}
