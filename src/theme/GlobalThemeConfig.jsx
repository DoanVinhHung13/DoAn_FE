// App.tsx
import { ConfigProvider, theme as antdTheme } from "antd"
import { useContext } from "react"
// import ThemeConfigAntd from "./ThemeConfigAntd"
import { StoreContext } from "src/contexts"

export const ColorPrimary = "#16A34A"
export const ColorDefault = "#ffffff"
export const ColorSecondary = "#ECFDF5"

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
          colorInfo: ColorPrimary,
          colorPrimary: ColorPrimary,
          fontSize: 16,
          fontFamily: `"Inter", Helvetica, sans-serif`,
          colorBgBase: isDarkMode ? "#252525" : ColorDefault,
          colorIcon: isDarkMode ? ColorDefault : "#000",
        },
        components: {
          Button: {
            defaultBg: ColorDefault,
            borderRadius: 4,
            borderRadiusLG: 4,
            lineWidth: 2,
            lineWidthFocus: 3,
          },
          Table: {
            headerColor: ColorDefault,
            headerBg: ColorPrimary,
            cellPaddingInline: 12,
            cellPaddingBlock: 8,
            headerBorderRadius: 4,
            borderRadius: 4,
            fontSize: 14,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default GlobalThemeConfig
