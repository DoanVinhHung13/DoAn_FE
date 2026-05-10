import { TreeSelect } from "antd"

import PropTypes from "prop-types"
const TreeSelectCustom = ({ label, children, style, ...rest }) => {
  return (
    <TreeSelect
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
}

TreeSelectCustom.defaultProps = { style: {}, label: "" }
