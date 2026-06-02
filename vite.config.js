import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ mạng LAN (để test QR trên điện thoại)
    port: 5173,
  }
})
