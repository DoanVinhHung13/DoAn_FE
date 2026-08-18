import { ConfigProvider, theme as antdTheme } from "antd"
import viVN from "antd/locale/vi_VN"
import { useContext } from "react"
import { StoreContext } from "src/contexts"
import designTokens from "./designTokens"

const dt = designTokens

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext)
  const { isDarkMode } = themeStore

  const colorBgBase = isDarkMode ? "#101815" : dt.colors.surface
  const colorBgLayout = isDarkMode ? "#0f1714" : dt.colors.background
  const colorBgContainer = isDarkMode ? "#17221d" : dt.colors.surface
  const colorBorder = isDarkMode ? "#30443a" : dt.colors.border

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDarkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          /* ── Brand colours ── */
          colorPrimary: dt.colors.primary,
          colorPrimaryHover: dt.colors.primaryHover,
          colorPrimaryActive: dt.colors.primaryActive,
          colorInfo: dt.colors.info,
          colorSuccess: dt.colors.success,
          colorWarning: dt.colors.warning,
          colorError: dt.colors.error,
          colorLink: dt.colors.primary,
          colorLinkHover: dt.colors.primaryHover,

          /* ── Text & surfaces ── */
          colorTextBase: isDarkMode ? "#edf7f1" : dt.colors.textPrimary,
          colorText: isDarkMode ? "#edf7f1" : dt.colors.textPrimary,
          colorTextSecondary: isDarkMode ? "#b4c7bc" : dt.colors.textSecondary,
          colorTextTertiary: isDarkMode ? "#8fa69a" : dt.colors.textMuted,
          colorBgBase,
          colorBgLayout,
          colorBgContainer,
          colorBorder,

          /* ── Typography ── */
          fontSize: dt.typography.body,
          fontFamily: dt.typography.fontFamily,

          /* ── Shape ── */
          borderRadius: dt.radius.md,

          /* ── Control heights (applies globally) ── */
          controlHeight: dt.controlHeight.md,
          controlHeightSM: dt.controlHeight.sm,
          controlHeightLG: dt.controlHeight.lg,
        },
        components: {
          Button: {
            controlHeight: dt.controlHeight.md,
            controlHeightSM: dt.controlHeight.sm,
            controlHeightLG: dt.controlHeight.lg,
            fontWeight: 600,
            borderRadius: dt.radius.md,
            borderRadiusLG: dt.radius.md,
            lineWidth: 1,
          },
          Input: {
            controlHeight: dt.controlHeight.md,
            controlHeightSM: dt.controlHeight.sm,
            controlHeightLG: dt.controlHeight.lg,
            activeShadow: `0 0 0 3px ${dt.colors.primarySoft}`,
          },
          Select: {
            controlHeight: dt.controlHeight.md,
            controlHeightSM: dt.controlHeight.sm,
            controlHeightLG: dt.controlHeight.lg,
          },
          DatePicker: {
            controlHeight: dt.controlHeight.md,
            controlHeightSM: dt.controlHeight.sm,
            controlHeightLG: dt.controlHeight.lg,
          },
          Menu: {
            itemHeight: 40,
            itemBorderRadius: dt.radius.md,
            itemSelectedBg: dt.colors.primarySoft,
            itemSelectedColor: dt.colors.primary,
            itemHoverBg: dt.colors.surfaceMuted,
          },
          Card: {
            borderRadiusLG: dt.radius.lg,
          },
          Table: {
            headerBg: dt.colors.primary,
            headerColor: "#ffffff",
            headerFontSize: 12.5,
            cellPaddingInline: dt.spacing.lg,
            cellPaddingBlock: 10,
            borderRadius: dt.radius.lg,
            fontSize: dt.typography.body,
            rowHoverBg: dt.colors.primarySoft,
          },
          Modal: {
            borderRadiusLG: dt.radius.xl,
          },
          Pagination: {
            itemActiveBg: dt.colors.primarySoft,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default GlobalThemeConfig
