import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { TruncateTextWrapper } from './styled/TruncateTextWrapper'

function TruncateText(props) {
  const { children, content } = props
  const truncateElement = useRef(null)

  const [isShowTooltips, setIsShowTooltips] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = truncateElement.current
      if (!element) return
      setIsShowTooltips(element.scrollHeight > element.clientHeight)
    })
    return () => cancelAnimationFrame(frame)
  }, [children, content])

  return (
    <TruncateTextWrapper {...props} title={isShowTooltips ? content : ''} ref={truncateElement}>
      {children}
    </TruncateTextWrapper>
  )
}

TruncateText.propTypes = {
  maxLine: PropTypes.number,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  content: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.node])
}

export default TruncateText
