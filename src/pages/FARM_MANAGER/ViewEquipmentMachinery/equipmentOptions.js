import dayjs from 'dayjs'

export const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'IN_USE', label: 'Đang sử dụng' },
  { value: 'MAINTENANCE', label: 'Đang bảo trì' },
  { value: 'BROKEN', label: 'Hỏng' },
  { value: 'RETIRED', label: 'Ngừng sử dụng' },
]

export const STATUS_TAG_MAP = {
  AVAILABLE: { color: 'green', label: 'Sẵn sàng' },
  IN_USE: { color: 'blue', label: 'Đang sử dụng' },
  MAINTENANCE: { color: 'warning', label: 'Đang bảo trì' },
  BROKEN: { color: 'error', label: 'Hỏng' },
  RETIRED: { color: 'default', label: 'Ngừng sử dụng' },
}

export const getStatusMeta = (status) =>
  STATUS_TAG_MAP[status] || { color: 'default', label: status || 'Chưa cập nhật' }

export const toEquipmentPayload = (values) => ({
  name: values.name?.trim(),
  code: values.code?.trim() || `EQ-${Date.now()}`,
  type: values.type?.trim(),
  status: values.status,
  purchaseDate: values.purchaseDate ? dayjs(values.purchaseDate).toISOString() : null,
  description: values.description?.trim() || null,
})
