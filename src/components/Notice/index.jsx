import { notification } from "antd"

const recentNotices = new Map()

/**
 * notice() — Global toast notification.
 * Gọi tập trung từ axios interceptor. Không gọi trực tiếp message.success() / notification.open() ở page.
 *
 * @param {string}  msg       - Nội dung chính
 * @param {string}  desc      - Mô tả thêm (optional)
 * @param {string}  place     - Vị trí: "bottomRight" | "topRight" | "topLeft" | ...
 * @param {boolean} isSuccess - Tương thích ngược với caller cũ
 * @param {string}  type      - success | error | warning | info
 */
function notice({ msg = "", desc = "", place, isSuccess = true, type }) {
  const severity = type || (isSuccess ? "success" : "error")
  const isPositive = severity === "success"
  const palette = {
    success: { background: "#E5F5EB", border: "#86efac", text: "#15803d", desc: "#166534" },
    error: { background: "#FCCED4", border: "#fca5a5", text: "#b91c1c", desc: "#991b1b" },
    warning: { background: "#FFF7E6", border: "#facc15", text: "#a16207", desc: "#854d0e" },
    info: { background: "#E6F4FF", border: "#93c5fd", text: "#1d4ed8", desc: "#1e40af" },
  }[severity] || {
    background: "#E6F4FF",
    border: "#93c5fd",
    text: "#1d4ed8",
    desc: "#1e40af",
  }

  const noticeKey = `${severity}:${msg}:${desc}`
  const now = Date.now()
  if (recentNotices.get(noticeKey) > now) return
  recentNotices.set(noticeKey, now + 1200)
  window.setTimeout(() => recentNotices.delete(noticeKey), 1500)

  notification.open({
    className: `notification-custom ${severity}`,
    style: {
      background: palette.background,
      borderRadius: 12,
      border: `1px solid ${palette.border}`,
    },
    placement: place || "bottomRight",
    message: (
      <div
        style={{ color: palette.text, fontWeight: 600 }}
        role={isPositive ? "status" : "alert"}
        aria-live={isPositive ? "polite" : "assertive"}
      >
        {msg}
      </div>
    ),
    description: desc ? (
      <div style={{ color: palette.desc }}>{desc}</div>
    ) : null,
    duration: 3,
  })
}

export default notice
