// src/pages/SUPPORTPAGES/NotFound/index.jsx
import { Button } from "antd"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"

function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: 16,
      fontFamily: "Inter, sans-serif",
      background: "#f8fafc",
    }}>
      <div style={{ fontSize: 80, lineHeight: 1 }}>🌿</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: "#111827", margin: 0 }}>404</h1>
      <p style={{ fontSize: 18, color: "#6b7280", margin: 0 }}>
        Trang bạn tìm kiếm không tồn tại.
      </p>
      <Button
        type="primary"
        size="large"
        onClick={() => navigate(ROUTER.HOME)}
        style={{ marginTop: 8, borderRadius: 12, fontWeight: 600 }}
      >
        Về trang chủ
      </Button>
    </div>
  )
}

export default NotFound
