import { notification } from "antd"
import { getMsgClient } from "src/lib/stringsUtils"
import SvgIcon from "../SvgIcon"
import "./styles.scss"

const typeStyles = {
  success: { background: "#E5F5EB", className: "success", icon: "notice-success" },
  error: { background: "#FCCED4", className: "error", icon: "notice-error" },
  warning: { background: "#FFF7E6", className: "warning", icon: "notice-error" },
  info: { background: "#E6F4FF", className: "info", icon: "notice-success" },
}

function notice({ msg = "", desc, place, isSuccess = true, type }) {
  const resolvedType = type || (isSuccess ? "success" : "error")
  const ui = typeStyles[resolvedType] || typeStyles.error
  notification.open({
    className: `notification-custom ${ui.className}`,
    style: { background: ui.background },
    placement: place || "bottomRight",
    message: <div>{getMsgClient(msg || "")}</div>,
    description: <div>{getMsgClient(desc || "")}</div>,
    icon: <SvgIcon name={ui.icon} />,
    duration: 3,
  })
}

export default notice
