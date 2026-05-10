import { Checkbox } from "antd"
import PropTypes from "prop-types"

const getCheckboxType = ({ group, button }) => {
  if (group) return Checkbox.Group
  if (button) return Checkbox.Button
  return Checkbox
}

const CheckboxCustom = props => {
  const { group, button, ...rest } = props
  const ElementCheckbox = getCheckboxType({ group, button })
  return <ElementCheckbox {...rest} />
}

CheckboxCustom.propTypes = {
  group: PropTypes.bool,
  button: PropTypes.bool,
}

CheckboxCustom.defaultProps = {
  group: false,
  button: false,
}

export default CheckboxCustom
