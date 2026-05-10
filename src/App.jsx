import Providers from "./components/Providers/providers"
import AppShell from "./components/AppShell"
import { BrowserRouter } from "react-router"
import AppRouter from "./router/AppRouter"

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppShell>
          <AppRouter />
        </AppShell>
      </BrowserRouter>
    </Providers>
  )
}

export default App
