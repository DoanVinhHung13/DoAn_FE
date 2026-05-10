import { DatePicker } from "antd"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import "../index.scss"
const { RangePicker } = DatePicker

const typeMap = {
  ranger: RangePicker,
  default: DatePicker,
}
const DatePickerCustom = ({
  children,
  float = false,
  floatRight = false,
  value,
  label,
  style,
  type,
  className,
  ...rest
}) => {
  const Component = typeMap[type] || DatePicker

  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const floating = isFocused || hasValue
  const labelcss =
    type === "ranger"
      ? {
          "--label": `"${label?.length ? label[0] : rest?.placeholder[0]}"`,
          "--label2": `"${label?.length ? label[1] : rest?.placeholder[1]}"`,
        }
      : {
          "--label": `"${label || rest?.placeholder}"`,
        }

  useEffect(() => {
    // với multiple select, value có thể là mảng
    if (
      (Array.isArray(value) && value.length > 0) ||
      (!Array.isArray(value) && value != null && `${value}` !== "")
    ) {
      setHasValue(true)
    } else {
      setHasValue(false)
    }
  }, [value])
  return (
    <Component
      {...rest}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      format="DD/MM/YYYY"
      placeholder={floating ? "" : rest?.placeholder || label}
      className={[
        type === "ranger" ? "date-custom-ranger" : "date-custom",
        (float || label || rest?.placeholder) && floating && "floating",
        floatRight && "float-right",
        (float || label) && floating && "floating",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...labelcss, width: "100%", ...style }}
    >
      {children}
    </Component>
  )
}
export default DatePickerCustom

DatePickerCustom.propTypes = {
  style: PropTypes.object,
  type: PropTypes.oneOf(["ranger", "default"]),
  value: PropTypes.any,
  label: PropTypes.string,
  floating: PropTypes.bool,
  float: PropTypes.bool,
  floatRight: PropTypes.bool,
  className: PropTypes.string,
}

DatePickerCustom.defaultProps = { style: {}, type: "default" }
