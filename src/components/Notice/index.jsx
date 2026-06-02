import { notification } from "antd"

/**
 * notice() — Global toast notification.
 * Gọi tập trung từ axios interceptor. Không gọi trực tiếp message.success() / notification.open() ở page.
 *
 * @param {string}  msg       - Nội dung chính (hỗ trợ HTML)
 * @param {string}  desc      - Mô tả thêm (optional, hỗ trợ HTML)
 * @param {string}  place     - Vị trí: "bottomRight" | "topRight" | "topLeft" | ...
 * @param {boolean} isSuccess - true = thành công (xanh), false = lỗi (đỏ)
 */
function notice({ msg = "", desc = "", place, isSuccess = true }) {
  notification.open({
    className: `notification-custom ${isSuccess ? "success" : "error"}`,
    style: {
      background:   isSuccess ? "#E5F5EB" : "#FCCED4",
      borderRadius: 12,
      border:       `1px solid ${isSuccess ? "#86efac" : "#fca5a5"}`,
    },
    placement: place || "bottomRight",
    message: (
      <div
        style={{ color: isSuccess ? "#15803d" : "#b91c1c", fontWeight: 600 }}
        dangerouslySetInnerHTML={{ __html: msg }}
      />
    ),
    description: desc ? (
      <div
        style={{ color: isSuccess ? "#166534" : "#991b1b" }}
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    ) : null,
    duration: 3,
  })
}

export default notice
