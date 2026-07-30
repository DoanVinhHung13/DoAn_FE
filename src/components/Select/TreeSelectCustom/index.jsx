import { TreeSelect } from "antd"

import PropTypes from "prop-types"
const TreeSelectCustom = ({ label, children, style, size = "middle", ...rest }) => {
  return (
    <TreeSelect
      size={size}
      placeholder={label}
      style={{ width: "100%", ...style }}
      {...rest}
    >
      {children}
    </TreeSelect>
  )
}
export default TreeSelectCustom

TreeSelectCustom.propTypes = {
  style: PropTypes.object,
  label: PropTypes.string,
  size: PropTypes.oneOf(["small", "middle", "large"]),
}

TreeSelectCustom.defaultProps = { style: {}, label: "" }
