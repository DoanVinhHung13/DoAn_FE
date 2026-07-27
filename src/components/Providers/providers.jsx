import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'react-redux'
import { store } from 'src/redux/store'
import StoreProvider from 'src/contexts'
import GlobalThemeConfig from 'src/theme/GlobalThemeConfig'
import { ThemeStyledComponent } from 'src/theme/ThemeStyledComponent'
import { ThemeProvider } from 'styled-components'
import RealtimeSync from 'src/components/RealtimeSync'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 phút dữ liệu "tươi"
      gcTime:    1000 * 60 * 30,  // giữ cache 30 phút
      retry: 2,
    },
  },
})

/**
 * Providers — tập trung tất cả provider tại 1 chỗ.
 *
 * Thứ tự (từ ngoài vào trong, quan trọng):
 *   1. QueryClientProvider  — React Query (ngoài cùng)
 *   2. ThemeProvider        — styled-components tokens
 *   3. Redux Provider       — global Redux store
 *   4. StoreProvider        — Context API (theme, modal, routerBefore)
 *   5. GlobalThemeConfig    — Antd ConfigProvider (đọc themeStore từ Context)
 */
const Providers = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={ThemeStyledComponent}>
      <Provider store={store}>
        <StoreProvider>
          <GlobalThemeConfig>
            <RealtimeSync />
            {children}
          </GlobalThemeConfig>
        </StoreProvider>
      </Provider>
    </ThemeProvider>
    <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
  </QueryClientProvider>
)

export default Providers
