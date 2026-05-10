import { Button } from "antd"
import PropTypes from "prop-types"
import SvgIcon from "src/components/SvgIcon"
//variant: "outlined", "dashed", "solid", "filled", "text", "link"
// color: ["default", "primary", "danger", "blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"];
const ButtonCustom = ({ children, iconName, antMode = true, ...rest }) => {
  return (
    <Button variant={"solid"} color={"primary"} {...rest}>
      <div className="d-flex-center">
        <SvgIcon
          antMode={!antMode ? "" : "colorTextLightSolid"}
          name={iconName}
          className="mr-8"
        />
        <span>{children}</span>
      </div>
    </Button>
  )
}

ButtonCustom.propTypes = {
  iconName: PropTypes.string,
}

ButtonCustom.defaultProps = {
  iconName: "",
}

export default ButtonCustom
