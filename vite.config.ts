import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/store/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Frappe SDK routes — direct to ERPNext (must be listed before the generic /api catch-all)
      '/api/method': { target: 'http://localhost:8001', changeOrigin: true },
      '/api/resource': { target: 'http://localhost:8001', changeOrigin: true },
      '/files': { target: 'http://localhost:8001', changeOrigin: true },
      // Custom server.js routes (auth, orders, coupons, homepage)
      '/api': { target: 'http://localhost:5500', changeOrigin: true },
      '/erp': { target: 'http://localhost:5500', changeOrigin: true },
      '/catalog_images': { target: 'http://localhost:5500', changeOrigin: true },
    },
  },
})
