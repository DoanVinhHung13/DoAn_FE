import { Provider } from "react-redux"
import { store } from "src/redux/store"
import StoreProvider from "src/contexts"
import GlobalThemeConfig from "src/theme/GlobalThemeConfig"
import { ThemeStyledComponent } from "src/theme/ThemeStyledComponent"
import { ThemeProvider } from "styled-components"
import RealtimeSync from "src/components/RealtimeSync"

const Providers = ({ children }) => (
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
)

export default Providers
