import http from '../01_axios'
import {
  apiGetPortalStatus,
  apiGetPortalSyncHistory,
  apiSavePortalCredentials,
  apiVerifyPortalConnection,
} from './urls'

const getPortalStatus = () => http.get(apiGetPortalStatus)
const getPortalSyncHistory = () => http.get(apiGetPortalSyncHistory)
const savePortalCredentials = (body) => http.post(apiSavePortalCredentials, body)
const verifyPortalConnection = () => http.post(apiVerifyPortalConnection)

const HtxPortalSettingsService = {
  getPortalStatus,
  getPortalSyncHistory,
  savePortalCredentials,
  verifyPortalConnection,
}

export default HtxPortalSettingsService
