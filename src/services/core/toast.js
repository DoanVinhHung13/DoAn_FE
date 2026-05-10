import notice from "src/components/Notice"

export const showSuccess = (msg, desc) =>
  notice({ msg, desc, isSuccess: true, type: "success" })
export const showError = (msg, desc) =>
  notice({ msg, desc, isSuccess: false, type: "error" })
export const showWarning = (msg, desc) =>
  notice({ msg, desc, isSuccess: false, type: "warning" })
export const showInfo = (msg, desc) =>
  notice({ msg, desc, isSuccess: true, type: "info" })

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
}
