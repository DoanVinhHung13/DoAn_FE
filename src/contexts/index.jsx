import React, { useState } from 'react'

// This module intentionally exports both the provider and its context for the
// application's single context entry point.
/* eslint-disable react-refresh/only-export-components */

export const StoreContext = React.createContext(null)

/**
 * StoreProvider — Context API cho các state KHÔNG phải auth.
 *
 * Nguyên tắc phân chia:
 *   - Auth state (user, token, isLoggedIn) → Redux (appGlobal slice)
 *   - UI/nav state (theme, modal, routerBefore) → Context ở đây
 *
 * Không đặt loginStore hay userStore ở đây nữa — đọc trực tiếp từ Redux.
 */
function StoreProvider({ children }) {
  // UI theme preference
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Lưu URL trước khi bị redirect về Login (để quay lại sau khi đăng nhập)
  const [routerBeforeLogin, setRouterBeforeLogin] = useState(null)

  const store = {
    themeStore:        { isDarkMode, setIsDarkMode },
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
  }

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}

export default StoreProvider
