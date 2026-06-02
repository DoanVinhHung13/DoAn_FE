import { Provider } from "react-redux"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "styled-components"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { store } from "src/redux/store"
import StoreProvider from "src/contexts"
import { ThemeStyledComponent } from "src/theme/ThemeStyledComponent"
import { GOOGLE_CLIENT_ID } from "src/constants/constants"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 phút dữ liệu "tươi"
      gcTime:    1000 * 60 * 30, // giữ cache 30 phút (v5 đổi cacheTime → gcTime)
      retry:     2,
    },
  },
})

/**
 * Thứ tự providers (quan trọng):
 * 1. QueryClientProvider — ngoài cùng, ReactQueryDevtools cần nằm trong
 * 2. ThemeProvider      — styled-components theme tokens
 * 3. Redux Provider     — global Redux store
 * 4. StoreProvider      — Context API (login, user, darkMode, routerBefore)
 * 5. GoogleOAuthProvider — Google OAuth
 */
const Providers = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={ThemeStyledComponent}>
      <Provider store={store}>
        <StoreProvider>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
          </GoogleOAuthProvider>
        </StoreProvider>
      </Provider>
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
)

export default Providers
