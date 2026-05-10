import React, { useEffect, useState } from "react"
import STORAGE, { getStorage } from "src/lib/storage"

export const StoreContext = React.createContext(null)
function StoreProvider({ children }) {
  const initialTheme = localStorage.getItem("theme_mode")
  const [routerBeforeLogin, setRouterBeforeLogin] = useState(
    getStorage(STORAGE.RETURN_URL),
  )
  const [isLoginContext, setIsLoginContext] = useState(
    Boolean(getStorage(STORAGE.TOKEN)),
  )
  const [user, setUser] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(initialTheme === "dark")
  const [authModal, setAuthModal] = useState({ open: false, type: 'login' }) // 'login' or 'register'

  useEffect(() => {
    localStorage.setItem("theme_mode", isDarkMode ? "dark" : "light")
    document.body.classList.toggle("theme-dark", isDarkMode)
    document.body.classList.toggle("theme-light", !isDarkMode)
  }, [isDarkMode])

  const store = {
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
    loginStore: { isLoginContext, setIsLoginContext },
    userStore: { user, setUser },
    themeStore: { isDarkMode, setIsDarkMode },
    authModalStore: { authModal, setAuthModal },
  }
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default StoreProvider
