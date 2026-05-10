import "@ant-design/v5-patch-for-react-19"
import { createRoot } from "react-dom/client"
import "src/assets/css/globals.css"
import "src/assets/css/index.css"
import "src/assets/scss/index.scss"
import App from "./App.jsx"

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
)
