import PropTypes from "prop-types"
import cn from "src/lib/classnames"
import { ModalWrapper } from "./styled"

import "./style.scss"
import styles from "./styles.module.scss"

export default function CustomModal(props) {
  const { children, className, tilteStart, hiddenScroll } = props

  return (
    <ModalWrapper
      width={1024}
      style={{ top: 120 }}
      {...props}
      className={cn(className, { [styles.titleFlexStart]: tilteStart })}
      hiddenScroll={hiddenScroll}
      maskTransitionName=""
    >
      {children}
    </ModalWrapper>
  )
}
CustomModal.propTypes = {
  tilteStart: PropTypes.bool,
  className: PropTypes.string,
  hiddenScroll: PropTypes.bool,
}

CustomModal.defaultProps = {
  tilteStart: true,
  hiddenScroll: false,
  className: "",
}
