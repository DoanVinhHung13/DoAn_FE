import { defineConfig, minify } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const stripProductionDiagnostics = {
  name: 'strip-production-diagnostics',
  apply: 'build',
  async renderChunk(code, chunk) {
    const result = await minify(chunk.fileName, code, {
      compress: { dropConsole: true, dropDebugger: true },
    })
    return { code: result.code, map: null }
  },
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'production' ? [stripProductionDiagnostics] : [])],
  resolve: {
    alias: {
      src: path.resolve(dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ mạng LAN
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.eapls.io.vn',
        changeOrigin: true,
        secure: false,
      },
    },
  }
}))
