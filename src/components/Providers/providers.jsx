import { Provider } from "react-redux"
import StoreProvider from "src/contexts"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { store } from "src/redux/store"
import { ThemeStyledComponent } from "src/theme/ThemeStyledComponent"
import { ThemeProvider } from "styled-components"
// Tạo một instance QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // dữ liệu được xem là "tươi" trong 5 phút
      cacheTime: 1000 * 60 * 30, // cached data giữ trong 30 phút nếu không active
      retry: 2, // tự động thử lại tối đa 2 lần khi lỗi
    },
  },
})

const Providers = props => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={ThemeStyledComponent}>
        <Provider store={store}>
          <StoreProvider>{props.children}</StoreProvider>
        </Provider>
      </ThemeProvider>
      {/* Devtools chỉ hiển thị khi nằm trong QueryClientProvider */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}
export default Providers
