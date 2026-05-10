import js from "@eslint/js"
import pluginReact from "eslint-plugin-react"
import { defineConfig } from "eslint/config"
import globals from "globals"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // "import/no-unresolved": "error",
      "react/react-in-jsx-scope": "off", // Tắt lỗi yêu cầu import React
      // "react/prop-types": "off",
      "react/prop-types": ["error", { ignore: ["children"] }],
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly", // 👈 Fix lỗi 'process is not defined'
      },
    },
  },
])

