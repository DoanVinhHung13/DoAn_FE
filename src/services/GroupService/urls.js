// Group (HTX) API endpoints
export const apiGetGroups = '/groups'
export const apiCreateGroup = '/groups'
export const apiGetGroupById = (id) => `/groups/${id}`
export const apiUpdateGroup = (id) => `/groups/${id}`
export const apiDeleteGroup = (id) => `/groups/${id}`
export const apiGetGroupMembers = (id) => `/groups/${id}/members`
export const apiAddGroupMember = (id) => `/groups/${id}/members`
export const apiRemoveGroupMember = (id, userId) => `/groups/${id}/members/${userId}`
