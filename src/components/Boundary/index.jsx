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
    console.error("[ErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 16,
          fontFamily: "Inter, sans-serif",
        }}>
          <h2 style={{ color: "#ef4444", fontSize: 24, margin: 0 }}>
            Đã xảy ra lỗi không mong muốn
          </h2>
          <p style={{ color: "#6b7280", margin: 0 }}>
            {this.state.error?.message || "Vui lòng tải lại trang."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "8px 24px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
