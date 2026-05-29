import path from 'path'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.js'),
      name: 'aemet-es-sdk',
      fileName: (format) => `aemet-es-sdk.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        exports: 'named',
        globals: {}
      }
    },
    sourcemap: true,
    minify: true,
    target: 'esnext'
  },
  server: {
    proxy: {
      '/aemet': {
        target: 'https://opendata.aemet.es/opendata/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/aemet/, '')
      }
    }
  }
})
