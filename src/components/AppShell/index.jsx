import { App as AntdApp } from "antd"
import ErrorBoundary from "src/components/Boundary"
import DefaultAction from "src/components/Layout/DefaultAction/DefaultAction"
import GlobalThemeConfig from "src/theme/GlobalThemeConfig"

const AppShell = ({ children }) => {
  return (
    <GlobalThemeConfig>
      <AntdApp>
        <ErrorBoundary>
          <div className="layout-center">
            <div className="layout-max-width">
              <DefaultAction>{children}</DefaultAction>
            </div>
          </div>
        </ErrorBoundary>
      </AntdApp>
    </GlobalThemeConfig>
  )
}

export default AppShell
