import { TimePicker } from "antd"
import PropTypes from "prop-types"
import "../index.scss"

const getDateTimeType = ({ ranger }) => {
  if (ranger) return TimePicker.RangePicker
  return TimePicker
}
const TimePickerCustom = ({ ranger, children, style, ...rest }) => {
  const ElementInput = getDateTimeType({ ranger })
  return (
    <ElementInput {...rest} style={{ width: "100%", ...style }}>
      {children}
    </ElementInput>
  )
}
export default TimePickerCustom

TimePickerCustom.propTypes = { style: PropTypes.object, ranger: PropTypes.bool }

TimePickerCustom.defaultProps = { style: {}, ranger: false }
