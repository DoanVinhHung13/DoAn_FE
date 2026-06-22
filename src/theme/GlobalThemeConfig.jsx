import { ConfigProvider, theme as antdTheme } from "antd"
import { useContext } from "react"
import { StoreContext } from "src/contexts"

// Màu primary của EAPLS (xanh lá nông nghiệp)
export const ColorPrimary = "#22c55e"

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext)
  const { isDarkMode } = themeStore

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary:  ColorPrimary,
          colorInfo:     ColorPrimary,
          colorSuccess:  "#16a34a",
          colorLink:     "#15803d",
          colorLinkHover: ColorPrimary,
          fontSize:      16,
          fontFamily:    `"Inter", "Roboto", Helvetica, sans-serif`,
          borderRadius:  12,
          colorBgBase:   isDarkMode ? "#1a1a1a" : "#ffffff",
          colorIcon:     isDarkMode ? "#ffffff" : "#000000",
        },
        components: {
          Button: {
            controlHeight:  40,
            fontWeight:     600,
            borderRadius:   8,
            borderRadiusLG: 8,
            lineWidth:      2,
          },
          Menu: {
            itemHeight:        50,
            itemSelectedBg:    "#f0fdf4",
            itemSelectedColor: "#15803d",
          },
          Table: {
            headerColor:        "#ffffff",
            headerBg:           ColorPrimary,
            cellPaddingInline:  12,
            cellPaddingBlock:   8,
            headerBorderRadius: 8,
            borderRadius:       8,
            fontSize:           14,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default GlobalThemeConfig
