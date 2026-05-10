import react from "@vitejs/plugin-react"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },
  plugins: [react()],

  build: {
    outDir: "dist",
    sourcemap: true,
    // Mặc định Vite là 500 (kB). Tăng lên 2000 (kB) hoặc lớn hơn
    chunkSizeWarningLimit: 2000,
    // Nếu muốn “vô hiệu” hẳn cảnh báo, đặt thành một số rất lớn:
    // chunkSizeWarningLimit: 10000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "/src/assets/scss/responsive/responsive.scss" as *;
        `,
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})
