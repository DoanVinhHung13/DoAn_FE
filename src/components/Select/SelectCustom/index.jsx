import { Select } from "antd"

import PropTypes from "prop-types"
const SelectCustom = ({ label, children, style, ...rest }) => {
  return (
    <Select placeholder={label} style={{ width: "100%", ...style }} {...rest}>
      {children}
    </Select>
  )
}
export default SelectCustom

SelectCustom.propTypes = { style: PropTypes.object, label: PropTypes.string }

SelectCustom.defaultProps = { style: {}, label: "" }

SelectCustom.Option = Select.Option
