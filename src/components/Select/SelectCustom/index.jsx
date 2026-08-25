import { Select } from "antd"

import PropTypes from "prop-types"
const SelectCustom = ({ label, children, style, size = "middle", ...rest }) => {
  return (
    <Select
      size={size}
      placeholder={label}
      style={{ width: "100%", ...style }}
      {...rest}
    >
      {children}
    </Select>
  )
}
export default SelectCustom

SelectCustom.propTypes = {
  style: PropTypes.object,
  label: PropTypes.string,
  size: PropTypes.oneOf(["small", "middle", "large"]),
}

SelectCustom.defaultProps = { style: {}, label: "" }

SelectCustom.Option = Select.Option
