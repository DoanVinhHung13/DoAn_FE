const NAME_KEYS = [
  'fullName',
  'fullname',
  'full_name',
  'displayName',
  'display_name',
  'userFullName',
  'userName',
  'username',
  'user_name',
  'name',
  'email',
  'updatedByName',
  'editedByName',
  'editorName',
  'createdByName',
  'recordedByName',
  'supervisorEditorName',
  'supervisorName',
  'reviewerName',
  'submittedByName',
  'performedByName',
  'approvedByName',
]

const NESTED_USER_KEYS = [
  'user',
  'userInfo',
  'account',
  'updatedBy',
  'updatedByUser',
  'createdBy',
  'createdByUser',
  'editedBy',
  'editor',
  'editorUser',
  'supervisor',
  'supervisorUser',
  'actor',
  'author',
  'recordedBy',
  'performedBy',
  'reviewer',
  'reviewedBy',
  'submittedBy',
  'approvedBy',
]

const INVALID_NAMES = new Set([
  'supervisor',
  'farm supervisor',
  'farm manager',
  'unknown',
  'không xác định',
  'chưa xác định',
])

const isUsableName = (value) => {
  if (typeof value !== 'string') return false

  const name = value.trim()
  if (!name || INVALID_NAMES.has(name.toLowerCase())) return false
  if (/^\d+$/.test(name) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(name)) return false

  return true
}

const getNameFromValue = (value, visited) => {
  if (isUsableName(value)) return value.trim()
  if (!value || typeof value !== 'object' || visited.has(value)) return null

  visited.add(value)

  for (const key of NAME_KEYS) {
    const name = getNameFromValue(value[key], visited)
    if (name) return name
  }

  for (const key of NESTED_USER_KEYS) {
    const name = getNameFromValue(value[key], visited)
    if (name) return name
  }

  return null
}

export const getUserDisplayName = (...candidates) => {
  const visited = new WeakSet()

  for (const candidate of candidates) {
    const name = getNameFromValue(candidate, visited)
    if (name) return name
  }

  return 'Chưa xác định'
}

export default getUserDisplayName
