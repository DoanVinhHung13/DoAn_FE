import http from '../01_axios'

const fertilizerSuggestions = ({ keyword, take = 10, signal } = {}) =>
  http.get('/fertilizer-catalogs/suggestions', { params: { keyword, take }, signal, skipNotice: true })
const fertilizerPrefill = ({ id, signal }) => http.get(`/fertilizer-catalogs/${id}/prefill`, { signal, skipNotice: true })
const pesticideSuggestions = ({ keyword, take = 10, signal } = {}) =>
  http.get('/pesticide-catalogs/suggestions', { params: { keyword, take }, signal, skipNotice: true })
const pesticidePrefill = ({ id, signal }) => http.get(`/pesticide-catalogs/${id}/prefill`, { signal, skipNotice: true })

export const getApiData = response => response?.data?.data ?? response?.data ?? []
export default { fertilizerSuggestions, fertilizerPrefill, pesticideSuggestions, pesticidePrefill }
