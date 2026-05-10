import { Select } from "antd"
import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import "./SelectCustom.scss"

const SelectCustom = ({
  label = "",
  value,
  style = {},
  float = false,
  floatRight = false,
  className,
  children,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const floating = isFocused || hasValue
  const labelcss = {
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
    <Select
      className={[
        "select-custom",
        (float || label) && floating && "floating",
        floatRight && "float-right",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...labelcss,
        width: "100%",
        ...style,
      }}
      value={value}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      placeholder={floating ? "" : rest?.placeholder || label}
      {...rest}
    >
      {children}
    </Select>
  )
}

SelectCustom.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,

  style: PropTypes.object,
  value: PropTypes.any,
  float: PropTypes.bool,
  floatRight: PropTypes.bool,
}

SelectCustom.Option = Select.Option
export default SelectCustom
