// App.tsx
import { ConfigProvider, theme as antdTheme } from "antd"
import { useContext } from "react"
// import ThemeConfigAntd from "./ThemeConfigAntd"
import { StoreContext } from "src/contexts"
import { APP_THEMES, THEME_TOKENS } from "./themeTokens"

export const ColorPrimary = THEME_TOKENS.primary
export const ColorDefault = THEME_TOKENS.baseBackground
export const ColorSecondary = THEME_TOKENS.secondary

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext)
  const { isDarkMode } = themeStore
  const currentTheme = isDarkMode ? APP_THEMES.dark : APP_THEMES.light

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorInfo: currentTheme.primary,
          colorPrimary: currentTheme.primary,
          fontSize: 16,
          fontFamily: `"Inter", Helvetica, sans-serif`,
          colorTextBase: currentTheme.text,
          colorBgBase: currentTheme.background,
          colorBgContainer: currentTheme.background,
          colorBorder: currentTheme.border,
          colorIcon: currentTheme.text,
        },
        components: {
          Button: {
            colorPrimary: currentTheme.primary,
            colorPrimaryHover: currentTheme.primaryHover,
            defaultBg: currentTheme.background,
            borderRadius: 4,
            borderRadiusLG: 4,
            lineWidth: 2,
            lineWidthFocus: 3,
          },
          Table: {
            headerColor: isDarkMode ? currentTheme.text : ColorDefault,
            headerBg: currentTheme.primary,
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
