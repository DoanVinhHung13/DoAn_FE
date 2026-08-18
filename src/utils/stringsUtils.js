/**
 * Lấy message lỗi để hiển thị cho client
 * File này được tạo lại để phục hồi file bị xóa nhầm
 */
export const getMsgClient = msg => {
  if (!msg) return "Đã có lỗi xảy ra"
  return msg
}
