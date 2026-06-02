import http from '../01_axios'
import {
  apiGetGroups,
  apiCreateGroup,
  apiGetGroupById,
  apiUpdateGroup,
  apiDeleteGroup,
  apiGetGroupMembers,
  apiAddGroupMember,
  apiRemoveGroupMember,
} from './urls'

const getGroups = (params) => http.get(apiGetGroups, { params })
const createGroup = (body) => http.post(apiCreateGroup, body)
const getGroupById = (id) => http.get(apiGetGroupById(id))
const updateGroup = (id, body) => http.put(apiUpdateGroup(id), body)
const deleteGroup = (id) => http.delete(apiDeleteGroup(id))
const getGroupMembers = (id) => http.get(apiGetGroupMembers(id))
const addGroupMember = (id, body) => http.post(apiAddGroupMember(id), body)
const removeGroupMember = (id, userId) => http.delete(apiRemoveGroupMember(id, userId))

const GroupService = {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
}

export default GroupService
