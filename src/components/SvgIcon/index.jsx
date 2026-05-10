import { theme } from "antd"
import PropTypes from "prop-types"
import styled, { css } from "styled-components"
import listSVGIcon from "./icons"
const SvgIconStyle = styled.span`
  svg path {
    ${props =>
      props.$inputColor &&
      css`
        fill: ${props.$inputColor};
      `}
  }
`
export default function SvgIcon(props) {
  const { token } = theme.useToken()
  const { name, className, antMode, ...rest } = props
  const iconElement = listSVGIcon[name]

  if (!iconElement) return null
  return (
    <SvgIconStyle
      $inputColor={antMode ? token[antMode] : undefined}
      className={`d-flex align-item-center justify-content-center ${className}`}
      {...rest}
    >
      {iconElement}
    </SvgIconStyle>
  )
}

SvgIcon.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  antMode: PropTypes.bool,
}

SvgIcon.defaultProps = {
  className: "",
  onClick: null,
  antMode: false,
}
