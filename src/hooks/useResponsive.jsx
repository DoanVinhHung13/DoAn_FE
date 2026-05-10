import useWindowSize from "src/hooks/useWindowSize"

export const useResponsive = () => {
  const windowSize = useWindowSize()

  // Tính toán các giá trị responsive dựa trên windowSize.width
  const isLaptop = windowSize.width < 1507
  const isDesktop = windowSize.width > 1200
  const isTablet = windowSize.width < 991
  const isMobile = windowSize.width < 768

  return { isLaptop, isDesktop, isTablet, isMobile }
}
