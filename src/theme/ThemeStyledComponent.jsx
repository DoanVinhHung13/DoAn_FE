import designTokens from './designTokens'

export const ThemeStyledComponent = {
  colors: designTokens.colors,
  spacing: designTokens.spacing,
  radius: designTokens.radius,
  shadows: designTokens.shadows,
  fonts: {
    family: designTokens.typography.fontFamily,
    sizeSm: designTokens.typography.caption,
    sizeBase: designTokens.typography.body,
    sizeMd: designTokens.typography.cardTitle,
    sizeLg: designTokens.typography.sectionTitle,
    sizeXl: designTokens.typography.pageTitle,
  },
}
