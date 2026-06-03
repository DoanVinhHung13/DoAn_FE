// src/components/ErrorBoundary/index.jsx
// Bắt lỗi React runtime, hiển thị thông báo rõ ràng thay vì trang trắng
import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "100vh", padding: "24px",
          background: "#fafafa", fontFamily: "Inter, sans-serif",
        }}>
          <div style={{
            maxWidth: 600, background: "#fff", borderRadius: 16, padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #fee2e2",
          }}>
            <h2 style={{ color: "#dc2626", margin: 0, marginBottom: 8 }}>
              ⚠️ Lỗi khởi động ứng dụng
            </h2>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              Ứng dụng gặp lỗi khi khởi chạy. Vui lòng mở{" "}
              <strong>Console (F12)</strong> để xem chi tiết lỗi.
            </p>
            <pre style={{
              background: "#fef2f2", color: "#991b1b", padding: "12px 16px",
              borderRadius: 8, fontSize: 12, overflowX: "auto", whiteSpace: "pre-wrap",
              border: "1px solid #fecaca",
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16, padding: "10px 24px", background: "#16a34a", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14,
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
