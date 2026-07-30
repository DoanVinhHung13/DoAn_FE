import React from "react"
import { TimePicker } from "antd"
import PropTypes from "prop-types"
import "../index.scss"

const getDateTimeType = ({ ranger }) => {
  if (ranger) return TimePicker.RangePicker
  return TimePicker
}
const TimePickerCustom = ({ ranger, children, style, size = "middle", ...rest }) => {
  const ElementInput = getDateTimeType({ ranger })
  return React.createElement(
    ElementInput,
    { ...rest, size, style: { width: "100%", ...style } },
    children,
  )
}
export default TimePickerCustom

TimePickerCustom.propTypes = {
  style: PropTypes.object,
  ranger: PropTypes.bool,
  size: PropTypes.oneOf(["small", "middle", "large"]),
}

TimePickerCustom.defaultProps = { style: {}, ranger: false }
