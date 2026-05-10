import { App as AntdApp } from "antd"
import { BrowserRouter } from "react-router"
import ErrorBoundary from "./components/Boundary"
import DefaultAction from "./components/Layout/DefaultAction/DefaultAction"
import Providers from "./components/Providers/providers"
import AppRouter from "./router/AppRouter"
import GlobalThemeConfig from "./theme/GlobalThemeConfig"
function App() {
  return (
    <Providers>
      <GlobalThemeConfig>
        <AntdApp>
          <BrowserRouter>
            <ErrorBoundary>
              <div className="layout-center">
                <div className="layout-max-width">
                  <DefaultAction>
                    <AppRouter />
                  </DefaultAction>
                </div>
              </div>
            </ErrorBoundary>
          </BrowserRouter>
        </AntdApp>
      </GlobalThemeConfig>
    </Providers>
  )
}

export default App
