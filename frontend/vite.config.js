import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':     'http://localhost:8000',
      '/products': 'http://localhost:8000',
      '/orders':   'http://localhost:8000',
      '/payments': 'http://localhost:8000',
    }
  }
})