import { DatePicker } from "antd"

import PropTypes from "prop-types"
const { RangePicker } = DatePicker

const typeMap = {
  ranger: RangePicker,
  default: DatePicker,
}
const DatePickerCustom = ({ children, style, type, ...rest }) => {
  const Component = typeMap[type] || DatePicker
  return (
    <Component {...rest} style={{ width: "100%", ...style }}>
      {children}
    </Component>
  )
}
export default DatePickerCustom

DatePickerCustom.propTypes = {
  style: PropTypes.object,
  type: PropTypes.oneOf(["ranger", "default"]),
}

DatePickerCustom.defaultProps = { style: {}, type: "default" }
