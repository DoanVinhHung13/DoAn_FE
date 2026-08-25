/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15803d",
          hover: "#166534",
          active: "#14532d",
          soft: "#f0fdf4",
          border: "#bbf7d0",
        },
        secondary: "#365b4d",
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8faf9",
        },
        border: {
          DEFAULT: "#dbe4df",
          strong: "#c7d5ce",
        },
        text: {
          primary: "#16302a",
          secondary: "#4d625a",
          muted: "#73817c",
        },
        success: {
          DEFAULT: "#15803d",
          soft: "#f0fdf4",
        },
        warning: {
          DEFAULT: "#b45309",
          soft: "#fffbeb",
        },
        danger: {
          DEFAULT: "#b42318",
          soft: "#fef2f2",
        },
        info: {
          DEFAULT: "#2563eb",
          soft: "#eff6ff",
        },
      },

      fontFamily: {
        sans: [
          "Inter",
          "Roboto",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
      },

      fontSize: {
        caption: ["12px", { lineHeight: "1.4" }],
        label: ["13px", { lineHeight: "1.4" }],
        secondary: ["13px", { lineHeight: "1.4" }],
        body: ["14px", { lineHeight: "1.5" }],
        card: ["16px", { lineHeight: "1.4" }],
        section: ["20px", { lineHeight: "1.3" }],
        page: ["28px", { lineHeight: "1.2" }],
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        xxl: "32px",
        xxxl: "40px",
      },

      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },

      boxShadow: {
        sm: "0 1px 2px rgba(22, 48, 42, 0.05)",
        DEFAULT: "0 4px 14px rgba(22, 48, 42, 0.08)",
        md: "0 4px 14px rgba(22, 48, 42, 0.08)",
        lg: "0 12px 32px rgba(22, 48, 42, 0.1)",
        primary: "0 4px 14px rgba(21, 128, 61, 0.25)",
        orange: "0 4px 14px rgba(234, 88, 12, 0.25)",
        blue: "0 4px 14px rgba(37, 99, 235, 0.25)",
      },

      height: {
        control: "40px",
        "control-sm": "32px",
        "control-lg": "48px",
      },

      minHeight: {
        control: "40px",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
