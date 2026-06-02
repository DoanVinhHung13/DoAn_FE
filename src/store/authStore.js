import { create } from 'zustand'
import authSession from 'src/services/core/authSession'

const getInitialUser = () => authSession.getUser() || null
const getInitialToken = () => authSession.getAccessToken() || null

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  setUser: (user) => {
    authSession.setUser(user || null)
    set({ user: user || null })
  },
  setToken: (token) => {
    authSession.setAccessToken(token || null)
    set({ token: token || null })
  },
  clearAuth: () => {
    authSession.clearSession()
    set({ user: null, token: null })
  },
}))
