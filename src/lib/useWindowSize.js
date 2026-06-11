import { useLayoutEffect, useState } from "react"

const UseWindowSize = (width, isLess = false) => {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      const currentWidth = isLess
        ? window.innerWidth < width
        : window.innerWidth > width
      setSize(currentWidth)
    }
    window.addEventListener("resize", updateSize)
    updateSize()
    return () => window.removeEventListener("resize", updateSize)
  }, [isLess, width])
  return size
}

const isLaptop = () => UseWindowSize(1507, true)

const isDesktop = () => UseWindowSize(1200)

const isTablet = () => UseWindowSize(991, true)

const isMobile = () => {
  let a = !!UseWindowSize(768, true)
  let b = !!UseWindowSize(991, true)
  return a || b
}
const isMobile2 = () => UseWindowSize(768, true)

const isSmallMobile = () => UseWindowSize(320, true)

export default {
  isLaptop,
  isDesktop,
  isMobile,
  isTablet,
  isSmallMobile,
  isMobile2,
}
