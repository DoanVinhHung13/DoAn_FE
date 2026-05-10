// FloatingInput.jsx
import { Input } from "antd"
import classNames from "classnames"
import PropTypes from "prop-types"
import { useState } from "react"
import "./FloatingInput.less" // CSS/LESS đi kèm

const FloatingInput = ({
  label,
  value,
  onChange,
  inputProps,
  textarea = false,
  className,
}) => {
  const [focused, setFocused] = useState(false)
  const hasValue = value !== undefined && value !== null && value !== ""
  const Container = textarea ? Input.TextArea : Input

  return (
    <div
      className={classNames("floating-label-container", className, {
        focused,
        "has-value": hasValue,
      })}
    >
      <Container
        {...inputProps}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label className="floating-label">{label}</label>
    </div>
  )
}

FloatingInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  inputProps: PropTypes.object,
  textarea: PropTypes.bool,
  className: PropTypes.string,
}

FloatingInput.defaultProps = {
  value: "",
  inputProps: {},
  textarea: false,
  className: "",
}

export default FloatingInput
