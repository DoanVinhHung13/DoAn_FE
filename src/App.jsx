// src/App.jsx
import { App as AntdApp } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import DefaultAction from './components/Layout/DefaultAction/DefaultAction'
import Providers from './components/Providers/providers'
import AppRouter from './router/AppRouter'

/**
 * Thứ tự wrapper (từ ngoài vào trong):
 *
 *   Providers
 *     ├─ QueryClientProvider
 *     ├─ ThemeProvider (styled-components)
 *     ├─ Redux Provider
 *     ├─ StoreProvider (Context: theme, modal, routerBefore)
 *     └─ GlobalThemeConfig (Antd ConfigProvider)
 *          └─ AntdApp          ← kích hoạt static notification/message
 *               └─ BrowserRouter
 *                    └─ ErrorBoundary
 *                         └─ DefaultAction  ← boot: đọc token → fetch /me → Redux
 *                              └─ AppRouter
 */
function App() {
  return (
    <Providers>
      <AntdApp>
        <BrowserRouter>
          <ErrorBoundary>
            <DefaultAction>
              <AppRouter />
            </DefaultAction>
          </ErrorBoundary>
        </BrowserRouter>
      </AntdApp>
    </Providers>
  )
}

export default App
