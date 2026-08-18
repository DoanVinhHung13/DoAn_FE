/**
 * Lấy label trạng thái
 *
 * @param {Object} item - Item cần lấy status
 * @returns {string}
 */
export const getStatusLabel = item => {
  if (typeof item?.isActive === "boolean")
    return item.isActive ? "Hoạt động" : "Ngừng hoạt động"
  if (typeof item?.IsActive === "boolean")
    return item.IsActive ? "Hoạt động" : "Ngừng hoạt động"
  const status = String(item?.status || "").toLowerCase()
  const inactive = [
    "inactive",
    "disabled",
    "deleted",
    "ngừng hoạt động",
    "ngung hoat dong",
  ].includes(status)
  return inactive ? "Ngừng hoạt động" : "Hoạt động"
}
