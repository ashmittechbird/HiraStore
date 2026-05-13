import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/erp': 'http://localhost:5500',
      '/api': 'http://localhost:5500',
      '/catalog_images': 'http://localhost:5500',
    },
  },
})
