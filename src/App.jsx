// src/App.jsx
import { App as AntdApp } from "antd";
import { BrowserRouter } from "react-router-dom";
import AppShell from "./components/AppShell";
import ErrorBoundary from "./components/ErrorBoundary";
import DefaultAction from "./components/Layout/DefaultAction/DefaultAction";
import Providers from "./components/Providers/providers";
import AppRouter from "./router/AppRouter";
import GlobalThemeConfig from "./theme/GlobalThemeConfig";

/**
 * Thứ tự wrapper (từ ngoài vào trong):
 * Providers → GlobalThemeConfig → AntdApp → BrowserRouter → ErrorBoundary → DefaultAction → AppShell → AppRouter
 *
 * Tại sao <AntdApp> ở đây?
 * notice() dùng notification.open() — static method của Antd — cần được kích hoạt
 * bởi <App> để hoạt động ngoài React component tree (ví dụ trong axios interceptor).
 */
function App() {
  return (
    <Providers>
      <GlobalThemeConfig>
        <AntdApp>
          <BrowserRouter>
            <ErrorBoundary>
              <DefaultAction>
                <AppShell>
                  <AppRouter />
                </AppShell>
              </DefaultAction>
            </ErrorBoundary>
          </BrowserRouter>
        </AntdApp>
      </GlobalThemeConfig>
    </Providers>
  );
}

export default App;
