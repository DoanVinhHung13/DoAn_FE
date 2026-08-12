import { ConfigProvider, theme as antdTheme } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { useContext } from 'react'
import { StoreContext } from 'src/contexts'
import designTokens from './designTokens'

function GlobalThemeConfig({ children }) {
  const { themeStore } = useContext(StoreContext)
  const { isDarkMode } = themeStore

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: designTokens.colors.primary,
          colorPrimaryHover: designTokens.colors.primaryHover,
          colorPrimaryActive: designTokens.colors.primaryActive,
          colorInfo: designTokens.colors.info,
          colorSuccess: designTokens.colors.success,
          colorWarning: designTokens.colors.warning,
          colorError: designTokens.colors.error,
          colorLink: designTokens.colors.primary,
          colorLinkHover: designTokens.colors.primaryHover,
          colorTextBase: designTokens.colors.textPrimary,
          colorBgBase: isDarkMode ? '#101815' : designTokens.colors.surface,
          colorBgLayout: isDarkMode ? '#0f1714' : designTokens.colors.background,
          colorBgContainer: isDarkMode ? '#17221d' : designTokens.colors.surface,
          colorBorder: isDarkMode ? '#30443a' : designTokens.colors.border,
          colorText: isDarkMode ? '#edf7f1' : designTokens.colors.textPrimary,
          colorTextSecondary: isDarkMode ? '#b4c7bc' : designTokens.colors.textSecondary,
          colorTextTertiary: isDarkMode ? '#8fa69a' : designTokens.colors.textMuted,
          fontSize: designTokens.typography.body,
          fontFamily: designTokens.typography.fontFamily,
          borderRadius: designTokens.radius.md,
          controlHeight: designTokens.controlHeight.md,
          controlHeightSM: designTokens.controlHeight.sm,
          controlHeightLG: designTokens.controlHeight.lg,
        },
        components: {
          Button: {
            controlHeight: designTokens.controlHeight.md,
            controlHeightSM: designTokens.controlHeight.sm,
            controlHeightLG: designTokens.controlHeight.lg,
            fontWeight: 600,
            borderRadius: designTokens.radius.md,
            borderRadiusLG: designTokens.radius.md,
            lineWidth: 1,
          },
          Input: {
            controlHeight: designTokens.controlHeight.md,
            controlHeightSM: designTokens.controlHeight.sm,
            controlHeightLG: designTokens.controlHeight.lg,
            activeShadow: `0 0 0 3px ${designTokens.colors.primarySoft}`,
          },
          Select: {
            controlHeight: designTokens.controlHeight.md,
            controlHeightSM: designTokens.controlHeight.sm,
            controlHeightLG: designTokens.controlHeight.lg,
          },
          DatePicker: {
            controlHeight: designTokens.controlHeight.md,
            controlHeightSM: designTokens.controlHeight.sm,
            controlHeightLG: designTokens.controlHeight.lg,
          },
          Menu: {
            itemHeight: 40,
            itemBorderRadius: designTokens.radius.md,
            itemSelectedBg: designTokens.colors.primarySoft,
            itemSelectedColor: designTokens.colors.primary,
            itemHoverBg: designTokens.colors.surfaceMuted,
          },
          Card: {
            borderRadiusLG: designTokens.radius.lg,
          },
          Table: {
            headerBg: designTokens.colors.surfaceMuted,
            headerColor: designTokens.colors.textSecondary,
            cellPaddingInline: designTokens.spacing.lg,
            cellPaddingBlock: 12,
            borderRadius: designTokens.radius.lg,
            fontSize: designTokens.typography.body,
          },
          Modal: {
            borderRadiusLG: designTokens.radius.xl,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default GlobalThemeConfig
