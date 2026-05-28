import path from "path"
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/aemet': {
        target: 'https://opendata.aemet.es/opendata/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aemet/, ''),
      }
    }
  }
})
