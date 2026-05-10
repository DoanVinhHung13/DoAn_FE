import { Tooltip } from "antd"
import PropTypes from "prop-types"
import SvgIcon from "src/components/SvgIcon"
import ButtonCustom from "../Button"

export default function ButtonCircle(props) {
  const { children, style, iconName, ...rest } = props

  return (
    <Tooltip title={children}>
      <ButtonCustom
        shape="circle"
        color="default"
        size={"large"}
        style={{ backgroundColor: "#ffffff", ...style }}
        {...rest}
      >
        <SvgIcon name={iconName} />
      </ButtonCustom>
    </Tooltip>
  )
}
ButtonCircle.propTypes = { iconName: PropTypes.string, style: PropTypes.object }

ButtonCircle.defaultProps = { iconName: "", style: {} }
