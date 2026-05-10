import PropTypes from "prop-types"
import { TitleCustomWrapper } from "./styles"

const TitleCustom = ({ children, className, ...rest }) => {
  return (
    <TitleCustomWrapper>
      <div {...rest} className={`title-main ${className}`}>
        {children}
      </div>
    </TitleCustomWrapper>
  )
}
export default TitleCustom
TitleCustom.propTypes = {
  className: PropTypes.string,
}

TitleCustom.defaultProps = {
  className: "",
}
