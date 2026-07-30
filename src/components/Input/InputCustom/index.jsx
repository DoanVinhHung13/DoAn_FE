import { Input, InputNumber } from "antd"
import PropTypes from "prop-types"

const typeMap = {
  textarea: Input.TextArea,
  number: InputNumber,
  search: Input.Search,
  password: Input.Password,
  otp: Input.OTP,
  default: Input,
}

const InputCustom = ({ label, type, floating = false, className, size = 'middle', ...rest }) => {
  const Component = typeMap[type] || Input
  const style = {
    textarea: { minHeight: "80px", overflow: "hidden auto" },
    number: { width: "100%" },
  }
  return (
    <Component
      placeholder={label}
      size={size}
      style={style[type] ? style[type] : {}}
      className={[floating ? "floating-label" : "", className].filter(Boolean).join(" ")}
      enterButton={type === "search"}
      {...rest}
    />
  )
}

InputCustom.propTypes = {
  type: PropTypes.oneOf([
    "textarea",
    "number",
    "search",
    "password",
    "otp",
    "default",
  ]),
  label: PropTypes.string,
  floating: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "middle", "large"]),
}

InputCustom.defaultProps = { type: "default", label: "" }
export default InputCustom
