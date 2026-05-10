import React, { useState } from "react"
import STORAGE, { getStorage } from "src/lib/storage"

export const StoreContext = React.createContext(null)
function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState(
    getStorage(STORAGE.RETURN_URL),
  )
  const [isLoginContext, setIsLoginContext] = useState(
    Boolean(getStorage(STORAGE.TOKEN)),
  )
  const [user, setUser] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(false)

  const store = {
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
    loginStore: { isLoginContext, setIsLoginContext },
    userStore: { user, setUser },
    themeStore: { isDarkMode, setIsDarkMode },
  }
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default StoreProvider
