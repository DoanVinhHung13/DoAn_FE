/**
 * ThemeStyledComponent — Token cho styled-components ThemeProvider.
 * Truy cập trong styled component: ${({ theme }) => theme.colors.primary}
 */
export const ThemeStyledComponent = {
  colors: {
    primary:      "#22c55e",
    primaryDark:  "#16a34a",
    primaryLight: "#f0fdf4",
    secondary:    "#15803d",
    success:      "#16a34a",
    error:        "#ef4444",
    warning:      "#f59e0b",
    info:         "#3b82f6",
    // Backgrounds
    bgMain:       "#f8fafc",
    bgWhite:      "#ffffff",
    bgCard:       "#ffffff",
    // Text
    textPrimary:  "#111827",
    textSecondary: "#6b7280",
    textMuted:    "#9ca3af",
    // Border
    border:       "#e5e7eb",
    borderLight:  "#f3f4f6",
  },
  spacing: {
    xs:   4,
    sm:   8,
    md:   16,
    lg:   24,
    xl:   32,
    xxl:  48,
  },
  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    full: 9999,
  },
  shadows: {
    sm:  "0 1px 3px rgba(0,0,0,0.06)",
    md:  "0 4px 12px rgba(0,0,0,0.08)",
    lg:  "0 10px 30px rgba(0,0,0,0.10)",
    green: "0 4px 15px rgba(34,197,94,0.15)",
  },
  fonts: {
    family: `"Inter", "Roboto", Helvetica, sans-serif`,
    sizeSm:   12,
    sizeBase: 14,
    sizeMd:   16,
    sizeLg:   18,
    sizeXl:   24,
  },
}
