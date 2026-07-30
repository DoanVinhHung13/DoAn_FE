import { DatePicker } from "antd"

import PropTypes from "prop-types"
const { RangePicker } = DatePicker

const typeMap = {
  ranger: RangePicker,
  default: DatePicker,
}
const DatePickerCustom = ({ children, style, type, size = "middle", ...rest }) => {
  const Component = typeMap[type] || DatePicker
  return (
    <Component {...rest} size={size} style={{ width: "100%", ...style }}>
      {children}
    </Component>
  )
}
export default DatePickerCustom

DatePickerCustom.propTypes = {
  style: PropTypes.object,
  type: PropTypes.oneOf(["ranger", "default"]),
  size: PropTypes.oneOf(["small", "middle", "large"]),
}

DatePickerCustom.defaultProps = { style: {}, type: "default" }
